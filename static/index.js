//code in this block executes after the page has loaded
$(document).ready(function () {
	reloadPage()
	

	//when you press enter while focused on the textbox, call the addItem method
	$('#todo-input').keyup(function (e) {
		if (e.keyCode == 13) {
			addItem()
		}
	});

	//or, when you click the button directly
	$("#add-item-button").click(function () {
		addItem()
	})

	$("#r").click(function () {
		console.log("123")
	})
})

//goes through and populates the entire page with all of the data from the JSON items
function populateList(item) {
	$("#todo-overall").html("")
	var count = 1
	items.forEach(function (item) {
		//extract some info from the item
		let todoText = item['value']
		let itemAddedByServer = todoText
		let currentItemNumber = count
		let itemID = item['id']
		
		//some jQuery + bootstrap for new frontend rows/columns
		let newRow = $("<div>", { "class": "row text-center", "id": itemID });
		let numberColumn = $("<div>", { "class": "col-3 bold text-right" });
		numberColumn.html(currentItemNumber)
		let dataColumn = $("<div>", { "class": "col-5 text-right data" });
		dataColumn.html(itemAddedByServer)
		let editColumn = $("<div>", { "class": "col-2 text-left fa fa-pencil" })
		let deleteColumn = $("<div>", { "class": "col-2 text-left close fa fa-window-close" });

		//add all the new DOM elements to a row
		newRow.append(numberColumn)
		newRow.append(dataColumn)
		newRow.append(editColumn)
		newRow.append(deleteColumn)

		//when you click the editColumn, change the text to an editable textfield
		editColumn.click(function () {
			editItem(itemID)
		})

		//when you click the delteColumn, delete the corresponding ID from the backend
		deleteColumn.click(function () {
			deleteItem(itemID)
		})
		//append the row to the page
		$("#todo-overall").append(newRow)
		count += 1
	});
}

//reloads the entire page
function reloadPage() {
	
	//before doing that, sort all the todo items by timestamp
	items.sort((a, b) => (a.deadline > b.deadline) ? 1 : -1)
	populateList(items)
}

//function to make POST request to update item in firestore
function updateItem(id, newValue) {
	//ajax call to flask server
	$.ajax({
		url: "/update_item",
		type: "POST",
		contentType: "application/json; charset=utf-8",
		data: JSON.stringify({ "id": id, "new_value": newValue }),
		dataType: "json",
		success: function (data, textStatus, jqXHR) {
			//not the most efficient way of doing this, but this
			//loop goes through all the items
			//and updates the correct one on the front end, then reloads the page
			for (var i = items.length - 1; i >= 0; --i) {
				if (items[i].id == data['id']) {
					items[i].value = newValue
				}
			}
			reloadPage()
		},
		error: function (jqXHR, textStatus, errorThrown) {
			alert("error: " + errorThrown);
		}
	});
}

//front end editing (i.e. turn the text into an editable textbox)
function editItem(id) {
	//grab the element w/ the correct id and turn it into an editable textfield
	let item = $(`#${id}`).children(".data")
	item.attr('contentEditable', 'true');
	item.focus()

	let pencil = $(`#${id}`).children(".fa-pencil")
	pencil.removeClass("fa-pencil")
	pencil.addClass("fa-check")

	//when you click the button, update in firestore with updateItem(id, updatedValue)
	pencil.click(function () {
		let updatedValue = item.html()
		updateItem(id, updatedValue)
	})
}

//function to delete an item via firestore
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

//adds item to Firebase and the frontend of the site
function addItem() {
	let text = $("#todo-input").val()

	$.ajax({
		url: "/add_item",
		type: "POST",
		contentType: "application/json; charset=utf-8",
		data: JSON.stringify({ "item": text }),
		dataType: "json",
		success: function (data, textStatus, jqXHR) {
			//note: here we could just directly add the 'text' variable, but as a double
			//check of sorts, we're adding the item returned by the backend to the frontend
			//as a way of double-checking that the correct value was added
			let itemAddedByServer = data['value']
			let currentItemNumber = parseInt(data['count'])
			console.log("item being added to front end is", itemAddedByServer)
			let itemID = data['id']
			let timeStamp = data['timestamp']
			//add the item to the front end items array
			items.push({ 'id': itemID, 'timestamp': timeStamp, 'value': itemAddedByServer })
			//some front end work to add the newly added row
			// (potential to reuse some code from the populateList function)
			let newRow = $("<div>", { "class": "row text-center", "id": itemID });
			let numberColumn = $("<div>", { "class": "col-3 bold text-right" });

			numberColumn.html(currentItemNumber)

			let dataColumn = $("<div>", { "class": "col-5 text-right data" });
			dataColumn.html(itemAddedByServer)

			let editColumn = $("<div>", { "class": "col-2 text-left fa fa-pencil" })
			let deleteColumn = $("<div>", { "class": "col-2 text-left close fa fa-window-close" });
			
			//add the new item to the frontend
			newRow.append(numberColumn)
			newRow.append(dataColumn)
			newRow.append(editColumn)
			newRow.append(deleteColumn)

			//when we click on the X, trigger the backend deleteItem function
			deleteColumn.click(function () {
				//note this makes an AJAX call
				deleteItem(itemID)
			})
			//when we click on the pencil, trigger a frontend change that changes text
			//to an editable field
			editColumn.click(function () {
				editItem(itemID)
			})
			$("#todo-overall").append(newRow)
			$("#todo-input").val("")
		},
		error: function (jqXHR, textStatus, errorThrown) {
			alert("error: " + errorThrown);
		}
	});
}