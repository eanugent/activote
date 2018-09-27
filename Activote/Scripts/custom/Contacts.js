var contacts = {};

$(function () {
    contacts.refreshContacts();
});

contacts.sendInvite = function(contactID) {
    $.ajax({
        url: activoteGlobal.sitePath + 'Person/SendContactInvite',
        data: { id: contactID },
        success: function (data) {
            if (data.success) {
                alert("Invite Sent"); 
            }
            else {
                alert("Error sending invite: " + data.msg);
            }
        }
    });
}

contacts.deleteContact = function(contactID) {
    $.ajax({
        url: activoteGlobal.sitePath + 'Person/DeleteContact',
        data: { id: contactID },
        success: function (data) {
            alert("Contact Deleted");
            contacts.refreshContacts();
        }
    });
}

contacts.addContact = function() {
    var formData = new FormData($("#formNewContact")[0]);    

    $.ajax({
        url: activoteGlobal.sitePath + 'Person/AddContact',
        data: formData,
        method: "POST",
        processData: false,
        contentType: false,
        success: function (data) {
            contacts.refreshContacts();            
        }
    })
}

contacts.refreshContacts = function() {
    $.ajax({
        url: activoteGlobal.sitePath + 'Person/_Contacts',
        method: "POST",
        success: function (data) {
            $("#dvContacts").html(data);
            $("#formNewContact [name=FirstName]").focus();
        }
    })
}