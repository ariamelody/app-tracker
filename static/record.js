$(document).ready(function(){
    //when the page loads, display all the names
    reloadPage()
                            
    $("#submit").click(function(){                
        addItem()
    })

    $("#requirement").keypress(function(e){     
        if(e.which == 13) {
            addItem()
        }   
    })

    $("#comp_sort").click(function(){  
        console.log("comp_sort")              
        comp_sort()
    })
    $("#pos_sort").click(function(){  
        console.log("pos_sort")              
        pos_sort()
    })
    $("#date_sort").click(function(){  
        console.log("date_sort")              
        date_sort()
    })
})


// Signs-in Friendly Chat.
async function signIn() {
    // Sign in Firebase using popup auth and Google as the identity provider.
    var provider = new GoogleAuthProvider();
    await signInWithPopup(getAuth(), provider);
  }

// Signs-out of Friendly Chat.
function signOutUser() {
    // Sign out of Firebase.
    signOut(getAuth());
  }

// Initialize firebase auth
function initFirebaseAuth() {
    // Listen to auth state changes.
    onAuthStateChanged(getAuth(), authStateObserver);
  }

// Returns the signed-in user's profile Pic URL.
function getProfilePicUrl() {
    return getAuth().currentUser.photoURL || '/images/profile_placeholder.png';
  }
  
  // Returns the signed-in user's display name.
  function getUserName() {
    return getAuth().currentUser.displayName;
  }

// Returns true if a user is signed-in.
function isUserSignedIn() {
    return !!getAuth().currentUser;
  }



function selectStage(id){
    $("#edit_progress").click(function(){   
        $('#view1').attr('contenteditable', 'true');
        $('#view2').attr('contenteditable', 'true');
        $('#view3').attr('contenteditable', 'true');
        $('#view4').attr('contenteditable', 'true');
        $('#view5').attr('contenteditable', 'true');

        let new_select=$("<select>")
        let stages=["Stage","Apply","OA","Interview"]
        let status=["Status",'Pending', 'Complete']
        let decisions=["Decision",'App-In-Progress', 'Accepted','Rejected']
        let new_stage = ""
        let new_status = ""
        let new_decision=''
        let name=''
        
        $.each(stages, function(index, value){
            let new_option = $("<option>")
            $(new_option).text(value)
            $(new_option).attr("value",value)
            $(new_select).append(new_option)

        })
        name = "drop-down-"+id
        console.log(name)
        $(`#${name}`).append(new_select)
        $(new_select).selectmenu({
            change: function( event, data ) {
                new_stage=data.item.value
                updateView(id,new_stage,"stage")
            }
        });

        new_select=$("<select>")
        $.each(status, function(index, value){
            let new_option = $("<option>")
            $(new_option).text(value)
            $(new_option).attr("value",value)
            $(new_select).append(new_option)
        })
        $(`#${name}`).append(new_select)
        $(new_select).selectmenu({
            change: function( event, data ) {
                new_status=data.item.value
                updateView(id,new_status,"status")
            }
        });
        
        new_select=$("<select>")
        $.each(decisions, function(index, value){
            let new_option = $("<option>")
            $(new_option).text(value)
            $(new_option).attr("value",value)
            $(new_select).append(new_option)
        })
        name = "decision-"+id
        $(`#${name}`).append(new_select)
        $(new_select).selectmenu({
            change: function( event, data ) {
                new_decision=data.item.value
                updateView(id,new_decision,"decision")
            }
        });

        let submitbtn = $("<a>", { "class": "col-2 text-center data","href":"/view/"+id });
		submitbtn.html("Submit")
        $(`#${name}`).append(submitbtn)

        $(submitbtn).click(function () {


            let updatedValue = {
                "company": $('#view1').html(),
                "position": $("#view2").html(),
                "deadline": $('#view3').html(),
                "link": $('#view4').html(),
                "requirement": $('#view5').html(),
            }
            console.log(updatedValue)
            updateView(id,updatedValue['link'],"link")
            updateView(id,updatedValue['requirement'],"requirement")
            updateItem(id, updatedValue)
            window.location.href = "/view/"+id
        })

    })
    
}

function updateView(id, value, edited) {
    let option = edited
	//ajax call to flask server
	$.ajax({
		url: "/update_view",
		type: "POST",
		contentType: "application/json; charset=utf-8",
		data: JSON.stringify({ "id": id, "value":value, "option":option}),
		dataType: "json",
		success: function (data, textStatus, jqXHR) {
			//not the most efficient way of doing this, but this
			//loop goes through all the items
			//and updates the correct one on the front end, then reloads the page
            if (option=="stage"){
                for (var i = items.length - 1; i >= 0; --i) {
                    if (items[i].id == data['id']) {
                        items[i].stage = value
                    }
                }
            } else if (option=="status"){
                for (var i = items.length - 1; i >= 0; --i) {
                    if (items[i].id == data['id']) {
                        items[i].status = value
                    }
                }
            } else if (option=="link"){
                for (var i = items.length - 1; i >= 0; --i) {
                    if (items[i].id == data['id']) {
                        items[i].link = value
                    }
                }
            } else if (option=="requirement"){
                for (var i = items.length - 1; i >= 0; --i) {
                    if (items[i].id == data['id']) {
                        items[i].requirement = value
                    }
                }
            } else {
                for (var i = items.length - 1; i >= 0; --i) {
                    if (items[i].id == data['id']) {
                        items[i].decision = value
                    }
                }
            }
		},
		error: function (jqXHR, textStatus, errorThrown) {
			alert("error: " + errorThrown);
		}
	});
}

function reloadPage() {
	//before doing that, sort all the todo items by timestamp
	items.sort((a, b) => (a.timestamp > b.timestamp) ? 1 : -1)
	populateList(items)
}

function comp_sort() {
	//before doing that, sort all the todo items by timestamp
	items.sort((a, b) => (a.company > b.company) ? 1 : -1)
	populateList(items)
}
function pos_sort() {
	//before doing that, sort all the todo items by timestamp
	items.sort((a, b) => (a.position > b.position) ? 1 : -1)
	populateList(items)
}
function date_sort() {
	//before doing that, sort all the todo items by timestamp
	items.sort((a, b) => (a.deadline > b.deadline) ? 1 : -1)
	populateList(items)
}

function populateList(item) {
	$("#jobboard").html("")
	var count = 1
	items.forEach(function (item) {
		//extract some info from the item
		//let todoText = item['value']
		//let itemAddedByServer = todoText
		let currentItemNumber = count
		let itemID = item['id']
        let company = item['company']
        let position = item['position']
        let deadline = item['deadline']
        let link = item['link']
        //let stage = item['stage']
        //let status = item['status']
		
		//some jQuery + bootstrap for new frontend rows/columns
		let newRow = $("<div>", { "class": "row text-center row-list", "id": itemID });
		let numberColumn = $("<div>", { "class": "col-1 bold text-right" });
		numberColumn.html(currentItemNumber)

		let editcompany = itemID+"comp"
        let companyColumn = $("<a>", { "class": "col-2 text-center data", "href": link, "id":editcompany });
		companyColumn.html(company)
        let editposition = itemID+"pos"
        let positionColumn = $("<div>", { "class": "col-2 text-center data", "id":editposition });
		positionColumn.html(position)

        let editdeadline = itemID+"deadline"
        let deadlineColumn = $("<div>", { "class": "col-2 text-center data", "id": editdeadline});
		deadlineColumn.html(deadline)

        let goto = "view/"+itemID
        let infoColumn = $("<a>", { "class": "col-1 text-right data fa fa-info-circle", "href": goto});

        let editid = itemID+"edit"
        let editColumn = $("<div>", { "class": "col-1 text-right fa fa-pencil", "id": editid})

		let deleteColumn = $("<a>", { "class": "col-1 text-left close fa fa-window-close","href":"/" });

		//add all the new DOM elements to a row
		newRow.append(numberColumn)
		newRow.append(companyColumn)
        newRow.append(positionColumn)
        newRow.append(deadlineColumn)
        newRow.append(infoColumn)
		newRow.append(editColumn)
		newRow.append(deleteColumn)
        
      
		//when you click the editColumn, change the text to an editable textfield
		editColumn.click(function () {
			editItem(itemID, editid)
		})

		//when you click the delteColumn, delete the corresponding ID from the backend
		deleteColumn.click(function () {
			deleteItem(itemID)
		})
        selectStage(itemID)
        
		//append the row to the page
		$("#jobboard").append(newRow)
		count += 1
	});
}

//function to make POST request to update item in firestore
function updateItem(id, value) {
    let company = value['company']
    let position = value['position']
    let deadline = value['deadline']
	//ajax call to flask server
	$.ajax({
		url: "/update_item",
		type: "POST",
		contentType: "application/json; charset=utf-8",
		data: JSON.stringify({ "id": id, "company":company, "position":position, "deadline": deadline}),
		dataType: "json",
		success: function (data, textStatus, jqXHR) {
			//not the most efficient way of doing this, but this
			//loop goes through all the items
			//and updates the correct one on the front end, then reloads the page
			for (var i = items.length - 1; i >= 0; --i) {
				if (items[i].id == data['id']) {
					items[i].company = data['company']
                    items[i].position = data['position']
                    items[i].deadline = data['deadline']
				}
			}
			reloadPage()
		},
		error: function (jqXHR, textStatus, errorThrown) {
			alert("error: " + errorThrown);
		}
	});
}

function editItem(id,editid) {
	//grab the element w/ the correct id and turn it into an editable textfield
    $(`#${editid}`).removeClass("fa-pencil")
	$(`#${editid}`).addClass("fa-check")
    
    let edit1 = id+"comp"
    $(`#${edit1}`).attr('contenteditable', 'true');
    let edit2 = id+"pos"
    $(`#${edit2}`).attr('contenteditable', 'true');
    let edit3 = id+"deadline"
    $(`#${edit3}`).attr('contenteditable', 'true');
	//$(`#${edit1}`).focus()

	//when you click the button, update in firestore with updateItem(id, updatedValue)
	$(`#${editid}`).click(function () {

        let updatedValue = {
            "company": $(`#${edit1}`).html(),
            "position": $(`#${edit2}`).html(),
            "deadline": $(`#${edit3}`).html()
        }
		updateItem(id, updatedValue)
	})
}

function deleteItem(id) {
	$.ajax({
		url: "/delete_item",
		type: "POST",
		contentType: "application/json; charset=utf-8",
		data: JSON.stringify({ "id": id }),
		dataType: "json",
		success: function (data, textStatus, jqXHR) {
			console.log("success")
			//not the most efficient way of doing this, but go through the items JSON, remove
			//the one with the specified ID, and reload the page
			//alternatively, you could just seek out the frontend element with the ID and remove it
			for (var i = items.length - 1; i >= 0; --i) {
				if (items[i].id == data['id']) {
					items.splice(i, 1);
				}
			}
			reloadPage()
		},
		error: function (jqXHR, textStatus, errorThrown) {
			alert("error: " + errorThrown);
		}
	});
}

function addItem() {
	let company = $("#company").val()
    let position = $("#position").val()
    let deadline = $("#deadline").val()
    let link = $("#link").val()
    let requirement = ""
    let stage = "Apply"
    let status = "Pending"
    let decision = "App-In-Progress"

    let values = {
        "company": company,
        "position": position,
        "deadline": deadline,
        "link": link,
        "requirement": requirement,
        "stage": stage,
        "status": status,
        "decision":decision
    }
	$.ajax({
		url: "/add_item",
		type: "POST",
		contentType: "application/json; charset=utf-8",
		data: JSON.stringify({ "item": values }),
		dataType: "json",
		success: function (data, textStatus, jqXHR) {
			//note: here we could just directly add the 'text' variable, but as a double
			//check of sorts, we're adding the item returned by the backend to the frontend
			//as a way of double-checking that the correct value was added
			let itemAddedByServer = data['company']
			let currentItemNumber = parseInt(data['count'])
			console.log("item being added to front end is", itemAddedByServer)
			let itemID = data['id']
			let timeStamp = data['timestamp']
			//add the item to the front end items array
			items.push({ 'id': itemID, 'timestamp': timeStamp, 'company': itemAddedByServer['company'], 'position': itemAddedByServer['position'], 'deadline': itemAddedByServer['deadline'] })
			//some front end work to add the newly added row
			// (potential to reuse some code from the populateList function)
			let newRow = $("<div>", { "class": "row text-center row-list", "id": itemID });
		let numberColumn = $("<div>", { "class": "col-1 bold text-right" });
		numberColumn.html(currentItemNumber)

		let editcompany = itemID+"comp"
        let companyColumn = $("<a>", { "class": "col-2 text-center data", "href": link, "id":editcompany });
		companyColumn.html(company)
        let editposition = itemID+"pos"
        let positionColumn = $("<div>", { "class": "col-2 text-center data", "id":editposition });
		positionColumn.html(position)

        let editdeadline = itemID+"deadline"
        let deadlineColumn = $("<div>", { "class": "col-2 text-center data", "id": editdeadline});
		deadlineColumn.html(deadline)

        let goto = "view/"+itemID
        let infoColumn = $("<a>", { "class": "col-1 text-right data fa fa-info-circle", "href": goto});

        let editid = itemID+"edit"
        let editColumn = $("<div>", { "class": "col-1 text-right fa fa-pencil", "id": editid})

		let deleteColumn = $("<a>", { "class": "col-1 text-left close fa fa-window-close","href":"/" });

		//add all the new DOM elements to a row
		newRow.append(numberColumn)
		newRow.append(companyColumn)
        newRow.append(positionColumn)
        newRow.append(deadlineColumn)
        newRow.append(infoColumn)
		newRow.append(editColumn)
		newRow.append(deleteColumn)
        
      
		//when you click the editColumn, change the text to an editable textfield
		editColumn.click(function () {
			editItem(itemID, editid)
		})

		//when you click the delteColumn, delete the corresponding ID from the backend
		deleteColumn.click(function () {
			deleteItem(itemID)
		})
        selectStage(itemID)
            //append the row to the page
            $("#jobboard").append(newRow)
			$("#company").val("")
            $("#position").val("")
            $("#deadline").val("")
            $("#requirement").val("")
            $("#link").val("")
		},
		error: function (jqXHR, textStatus, errorThrown) {
			alert("error: " + errorThrown);
		}
	});
}


