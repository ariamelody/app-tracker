from flask import Flask
from flask import render_template
from flask import Response, request, jsonify

import json
import time

import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore

# Use a service account
cred = credentials.Certificate('key.json')
firebase_admin.initialize_app(cred)

db = firestore.client()

app = Flask(__name__)


#initial route called when page loaded via GET request
@app.route('/')
def record():
    docs = db.collection(u'items').stream()
    items = []
    count=0
    for doc in docs:
        data = doc.to_dict()
        data['id'] = doc.id
        items.append(data)
        count+=1
    return render_template("record.html", items=items,count=count)

@app.route('/view/<name>')
def view(name=None):
    docs = db.collection(u'items').stream()
    items = []
    for doc in docs:
        data = doc.to_dict()
        data['id'] = doc.id
        items.append(data)
        if doc.id == name:
            item = data

    stage = item['stage']
    status = item['status']
    decision = item['decision']
    progress="pro-0"
    if status=="Complete":
        progress="pro-1"

    return render_template("view.html", items=items, data=item, progress=progress, stage=stage, status=status,decision=decision)

#add item route
@app.route('/add_item', methods = ['GET', 'POST'])
def add_item():
    json_data = request.get_json()
    item = json_data['item']
    
    company = item['company']
    position = item['position']
    deadline = item['deadline']
    link = item['link']
    requirement = item['requirement']
    stage = item['stage']
    status = item['status']
    decision = item['decision']

    collection_ref = db.collection(u'items')
    doc_ref = collection_ref.document()
    #timestamp
    time_added = time.time()
    item_to_add = {'company': company, "position": position, "stage": stage, "status": status, "deadline": deadline, "link": link, "requirement":requirement,"decision": decision,'timestamp': time_added}
    doc_ref.set(item_to_add)
    total_count = len(collection_ref.get())
    #doc_ref.id is the last id
    item_to_return = {'company': item, 'count': total_count, 'id': doc_ref.id, 'timestamp': time_added}
    return jsonify(item_to_return)

#update route
@app.route('/update_item', methods = ['GET', 'POST'])
def update_item():
    json_data = request.get_json()
    id_to_update = json_data['id']
    new_comp = json_data['company']
    new_pos = json_data['position']
    new_deadline = json_data['deadline']
    #update item in collection
    db.collection('items').document(f'{id_to_update}').update({u'company': new_comp})
    db.collection('items').document(f'{id_to_update}').update({u'position': new_pos})
    db.collection('items').document(f'{id_to_update}').update({u'deadline': new_deadline})
    return json_data

@app.route('/update_view', methods = ['GET', 'POST'])
def update_view():
    json_data = request.get_json()
    id_to_update = json_data['id']
    new_val = json_data['value']
    new_op = json_data['option']
    print(new_val)
    print(new_op)
    #update item in collection
    if new_op=="stage":
        db.collection('items').document(f'{id_to_update}').update({u'stage': new_val})
    elif new_op=="status":
        db.collection('items').document(f'{id_to_update}').update({u'status': new_val})
    elif new_op=="link":
        db.collection('items').document(f'{id_to_update}').update({u'link': new_val})
    elif new_op=="requirement":
        db.collection('items').document(f'{id_to_update}').update({u'requirement': new_val})
    else:
        db.collection('items').document(f'{id_to_update}').update({u'decision': new_val})
    
    return json_data

#delete route
@app.route('/delete_item', methods = ['GET', 'POST'])
def delete_item():
    json_data = request.get_json()
    id_to_delete = json_data['id']
    #delete item from collection
    db.collection('items').document(f'{id_to_delete}').delete()
    item_to_return = {'id': id_to_delete}
    return jsonify(item_to_return)


if __name__ == "__main__":
    app.run(debug=True)