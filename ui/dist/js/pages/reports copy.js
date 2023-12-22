/**
 * IOT PORTAL 1.0.0
 * ------------------
 * Description:
 *      This is a js file used only for the reporting cards.
 */


var request_method_list = "getVersion, IOT_GetReport, IOT_GetReportColumns, IOT_GetReportsList, IOT_GetCustomerList, IOT_GetUsagePeriodList,";

var getFromAPI = function (dataparam, action, fail, is_async) {
    var request_method = dataparam.method;
    if (!request_method_list.includes(request_method)) {
        request_method_list += '<h5><strong>' + request_method + ' failed to load.</strong></h5>'
    }
    var maxtimeout = 180000;  //maxtimeout of 180 seconds (180 * 1000ms)
    var baseurl = "/api/reports.php";
    if (is_async == null) is_async = true;
    $.ajax({
        method: 'GET',
        type: 'JSON',
        contentType: 'application/json; charset=utf-8',
        url: baseurl,
        async: is_async,
        data: dataparam,
        dataType: 'JSON',
        //timeout: maxtimeout,
        success: function (data) {
            data = eval(data);
            if (action) action(data)
        },
        error: function (m) {
            var err = (m.responseJSON != null ? m.responseJSON : {
                status: false,
                message: [m.responseText]
            });
            if (!err.message) {
                err = {message: [err]}
            }
            console.log(err);
        }
    })
};
function GetReport() {

    isError = false
    if ($('#sel_report').val() == '') {
        toastr.error('Error - Please select a valid report.');
        isError = true
    }
    if ($('#sel_date').val() == '') {
        toastr.error('Error - Please select a valid reporting period.');
        isError = true
    }
    if ($('#sel_customer').val() == '') {
        toastr.error('Error - Please select a valid customer');
        isError = true
    }
    if (isError) return

    if (result_table != null) {
        //reset table
        result_table.destroy();
        result_table = null;
        $('#report_list tbody').html('');
        $('#report_list thead').html('');
        $('#report_list tfoot').html('');
    }

    //show loading
    $('#reports-loading').show()
   // $('#reports-body').hide()
    var columns = [];
    getFromAPI({
        method: 'IOT_GetReportColumns',
        report: $('#sel_report').val(),
    }, function (data) {
        result_table_columns = data.message;
        columns = $.map(data.message, function (v, i) {
            var columnConfig = {
                'data': v,
                'title': v,
                'render': function (a, display, val, row, e, f) {
                    return val[v];
                }
            };
        
            // Check if the column should have a date type
            if (v === 'date') {
                columnConfig.type = 'date';
            }
        
            return columnConfig;
        });
    }, null, false);

    //set the report header.
    var reportName = 'Report: ' + $('#sel_report').val() + ' <br> Customer: ' + $('#sel_customer').val() + ' <br> Period: ' + $('#sel_date').val();

    //set footer
    var str = '<tr class="text-bold">';
    for (var k in columns) {
        str += '<td></td>'
    }
    str += '</tr>';
    $('#report_list tfoot').html(str);

      
var result_data = [];
var sel_customer = $('#sel_customer').val();
getFromAPI({
    method: 'IOT_GetReport',
    report: $('#sel_report').val(),
}, function (data) {
    result_data = data.message.result;
}, null, false);


// Reinitialize DataTable
var dataTable = $('#report_list').DataTable({
    destroy: true, // Destroy the existing DataTable
    data: result_data,
    columns: columns,
});
// Specify the target date

$.fn.dataTable.ext.search.push(
    function (settings, data, dataIndex) {
        var targetDate = $('#sel_date').val();
        let outputDateString = convertDateString(targetDate);

        var dateObject = new Date(outputDateString);

        // Get the month (0-indexed, so add 1 to get the actual month)
        var month = dateObject.getMonth() + 1;
        var year = dateObject.getFullYear();
        
        // Assuming your date column is at index 2 (adjust if needed)
        var dateColumn = data[0];
        var parsedDate = moment(dateColumn, 'YYYY-MM-DD HH:mm:ss');

        // Check if the date matches the selected month and year
        return (
            (!month || parsedDate.month() == month) &&
            (!year || parsedDate.year() == year)
        );
    }
);
dataTable.draw();
dataTable.column(4).search(sel_customer).draw();

}

function paginateArray(array, currentPage, itemsPerPage) {
    // Calculate start and end indices for the current page
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    // Slice the array to get the items for the current page
    const currentPageItems = array.slice(startIndex, endIndex);

    // Calculate total number of pages
    const totalPages = Math.ceil(array.length / itemsPerPage);

    return {
        currentPageItems,
        currentPage,
        totalPages,
    };
}

// Function to filter items by date
function filterByDate(dateString, targetDate) {
    // Parse the date strings into Date objects
    var currentDate = new Date(dateString);
    var targetDateObj = new Date(targetDate);

    // Compare the date parts only (ignoring time)
    return currentDate.toISOString().slice(0, 10) === targetDateObj.toISOString().slice(0, 10);
}

function convertDateString(inputDateString) {
    // Assuming the input format is "MMM YYYY" (e.g., "SEP 2020")
    let inputDate = new Date(inputDateString + ' 01'); // Set day to the first day of the month
  
    // Format the output date as "YYYY-MM-DD HH:mm:ss"
    let outputDateString = inputDate.toISOString().slice(0, 19).replace('T', ' ');
  
    return outputDateString;
  }
  



function GetCustomersList() {
    $('#admin_customer').show()
    getFromAPI({
        method: 'IOT_GetCustomerList'
    }, function (data) {
        if (data.message != null) {
            $('#sel_customer')
                .find('option')
                .remove()
                .end()
            $('#sel_customer')
                .append('<option value="">Select One</option>')
            for (i = 0; i < data.message.length; i++) {
                var value = data.message[i]['customer']
                var text = data.message[i]['customer']
                if (value != null) {
                    selected = ''
                    $('#sel_customer')
                        .append('<option value="' + value + '" ' + selected + '>' + text + '</option>')
                }
            }
        }
    })
}

function GetPeriodList() {
    getFromAPI({
        method: 'IOT_GetUsagePeriodList'
    }, function (data) {
        if (data.message != null) {
            $('#sel_date')
                .find('option')
                .remove()
                .end()
            $('#sel_date')
                .append('<option value="">Select One</option>')
            for (i = 0; i < data.message.message.length; i++) {
                var value = data.message.message[i]['period']
                var text = data.message.message[i]['period']
                if (value != null) {
                    $('#sel_date')
                        .append($('<option>', {
                            value: value,
                            text: text
                        }))
                }
            }
        }
    })
}

function GetReportsList() {
    $('#sel_report')
        .find('option')
        .remove()
        .end()
    $('#sel_report')
        .append('<option value="">Select One</option>')
    getFromAPI({
        method: 'IOT_GetReportsList',
    }, function (data) {
        if (data.message != null) {
            for (i = 0; i < data.message.length; i++) {
                var value = data.message[i]
                var text = data.message[i]
                if (value != null) {
                    $('#sel_report')
                        .append($('<option>', {
                            value: value,
                            text: text
                        }))
                }
            }
        }
    })
}


function ExportReport(fileFormat) {
    //do something
    ShowExportReportDialog(fileFormat, $('#sel_report').val(), $('#sel_customer').val(), $('#sel_date').val())

}


var result_table = null;
var result_table_columns = [];

if(result_table != null){


// Register an API method that will empty the pipelined data, forcing an Ajax
$.fn.dataTable.Api.register('clearPipeline()', function () {
    return this.iterator('table', function (settings) {
        settings.clearCache = true;
    });
});

}





function ShowOrdersReport() {

    //show loading
    $('#reports-loading').show()
    $('#reports-body').hide()

    var current_date = new Date()
    var cyear = current_date.getFullYear()
    var shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    var short_month = shortMonths[current_date.getMonth()];
    var period = short_month.toUpperCase() + ' ' + current_date.getFullYear()

    $('#sel_report').val('Order List')
    $('#sel_date').val(period)

    GetReport()

    //hide loading
    $('#reports-loading').hide()
    $('#reports-body').show()

}
function convertDateString(inputDateString) {
    // Assuming the input format is "MMM YYYY" (e.g., "SEP 2020")
    let inputDate = new Date(inputDateString + ' 01'); // Set day to the first day of the month
  
    // Format the output date as "YYYY-MM-DD HH:mm:ss"
    let outputDateString = inputDate.toISOString().slice(0, 19).replace('T', ' ');
  
    return outputDateString;
  }
  


if (typeof jQuery === "undefined") {
   alert("AdminLTE requires jQuery");
}

//load this at the start of each page.
$(document).ready(function () {

    //show loading status
    $('#reports-loading').show()
    $('#reports-body').hide()

    //load dropdowns
    GetReportsList();
    GetPeriodList();
    GetCustomersList();

    //hide loading status
    $('#reports-loading').hide()
    $('#reports-body').show()


})