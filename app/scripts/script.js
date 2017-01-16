" use strict";

function newMessage() {
    var data = {
        'id': $("#new-message-id").val(),
        'group': $("#new-message-group").val(),
        'message': $("#new-message-content").val()
    };
    var apiUrl = '/messages/';
    $.ajax({
            url: apiUrl,
            type: 'POST',
            data: data,
            async: false
        }).done(function(result) {

            getMessagesCreateContent();
            $("#newModal").modal('hide');
            $('#main-alert').empty().append(createSuccessAlert('Success! message with id ' + result + '  added!'));
        })
        .fail(function(error) {
            $('#new-alert').empty().append(createWarningAlert('Error! Please check your input values and try again!'));
        });
}

function updateMessage() {
    var data = {
        'id': $("#message-id").val(),
        'group': $("#message-group").val(),
        'message': $("#message-content").val()
    };
    var apiUrl = '/messages/';
    $.ajax({
        url: apiUrl,
        type: 'POST',
        data: data
    }).done(function(result) {
        getMessagesCreateContent();
        $("#editModal").modal('hide');
        $('#main-alert').empty().append(createSuccessAlert('Success! message with id ' + result + '  Updated!'));
    }).fail(function(error) {
        $('#edit-alert').empty().append(createWarningAlert('Error! Cannot Update records please try again later!'));
    });
}

function deleteMessage() {
    var $input = $(this);
    var idToDelete = $input.attr("id-delete");
    var apiUrl = '/messages/' + idToDelete;
    $.ajax({
        url: apiUrl,
        type: 'DELETE'
    }).done(function(result) {
        getMessagesCreateContent();
        $("#deleteModal").modal('hide');
        $('#main-alert').empty().append(createSuccessAlert('Success! message with id ' + result + '  Deleted!'));
    }).fail(function(error) {
        $('#delete-alert').empty().append(createWarningAlert('Error! Cannot delete message try again later!'));
    });
}

function addDeleteIdToModal() {
    var $input = $(this);
    $("#confirmDelete").attr("id-delete", $input.attr("id-delete"));
}

function addEditIdToModal() {
    var $input = $(this);
    $("#message-id").val($input.attr("id-edit"));
    $("#message-group").val($input.attr("group-edit"));
    $("#message-content").val($input.attr("message-edit"));
}

function getMessagesCreateContent() {
    var apiUrl = "/messages";
    $.getJSON(apiUrl, function(data) {
        var columns = ['Id', 'Group', 'Message', 'CreatedDate', 'Edit', 'Delete'];
        createPageContent(data, columns, "#table-container");
    }).fail(function() {

        $('#main-alert').append(createAlert('Error! Something went wrong please try again later!'));
    });
}

function createPageContent(data, columns, placeholder) {
    $(placeholder).empty();
    var table = ' <table class="table table-bordred table-striped"><thead><tr>';
    $.each(columns, function(index, value) {
        table += '<th>' + value + '</th>';
    });
    table += ' </thead><tbody>';
    table += '</tbody></table>';
    $(placeholder).append(table);
    var groupSet = new Set();
    var messagesTodayCounter = 0;
    $.each(data, function(key, value) {
        var htmlTableRows;
        htmlTableRows += '<tr>';
        htmlTableRows += '<td> ' + value['id'] + '</td>';
        htmlTableRows += '<td> ' + value['group'] + '</td>';
        htmlTableRows += '<td> ' + value['message'] + '</td>';
        htmlTableRows += '<td> ' + new Date(value['createdDate']).toLocaleDateString() + '</td>';
        htmlTableRows += '<td><p data-placement="top" data-toggle="tooltip" title="Edit"><button message-edit="' + value['message'] + '" group-edit="' + value['group'] + '" id-edit ="' + value['id'] + '" class=" edit-message btn btn-primary btn-xs" data-title="Edit" data-toggle="modal" data-target="#editModal" ><span class="glyphicon glyphicon-pencil"></span></button></p></td>';
        htmlTableRows += '<td ><p  data-placement="top" data-toggle="tooltip" title="Delete"><button id-delete = "' + value['id'] + '" class="delete-message btn btn-danger btn-xs" data-title="Delete" data-toggle="modal" data-target="#deleteModal" ><span class="glyphicon glyphicon-trash"></span></button></p></td>';
        htmlTableRows += '</tr>';
        $(placeholder + ' ' + 'tbody').append(htmlTableRows);
        groupSet.add(value['group']);
        if (new Date(value['createdDate']).setHours(0, 0, 0, 0) === new Date(value['createdDate']).setHours(0, 0, 0, 0))
            messagesTodayCounter += 1;
    });
    $("#group-counter").text(groupSet.size);
    $("#message-counter").text(Object.keys(data).length);
    $("#today-message-counter").text(messagesTodayCounter);
    $(".delete-message").on("click", addDeleteIdToModal);
    $(".edit-message").on("click", addEditIdToModal);
}

function createSuccessAlert(message) {
    return '<div class="alert alert-success alert-dismissible fade in" role="alert"> <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">×</span></button> <strong>' + message + '</strong>  </div>';
}

function createWarningAlert(message) {
    return '<div class="alert alert-warning alert-dismissible fade in" role="alert"> <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">×</span></button> <strong>' + message + '</strong>  </div>';
}