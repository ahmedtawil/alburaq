"use strict";
let tableQuery = {

}
// Class definition
var KTOrdersList = function () {
    // Define shared variables
    var datatable;
    var filterMonth;
    var filterPayment;
    var table
    let dataRes

    let dateQuery = {

    }

    // Private functions
    var initordersList = function () {
        // Set date data order
        const tableRows = table.querySelectorAll('tbody tr');

        // Init datatable --- more info on datatables: https://datatables.net/manual/
        datatable = $(table).DataTable({
            "processing": true,
            "serverSide": true,
            "language": {
                "info": "عرض من _START_ إلى _END_ من مجموع _TOTAL_ سجل",
                "zeroRecords": "لا يوجد نتائج للبحث!",
                "infoEmpty": "لا يوجد بيانات!",
                "infoFiltered": "(تصفية من _MAX_  سجل)",
                "processing": '<i class="fa fa-spinner fa-spin fa-3x fa-fw"></i><span class="sr-only">جاري جلب البيانات...</span>'
            },


            "ajax": {
                url: "/orders/data/get",
                "dataSrc": 'orders',
                "dataFilter": function (res) {
                    dataRes = JSON.parse(res)
                    return res
                }
            },


            columns: [
                { data: 'serialNumber' },
                {
                    data: 'customer',

                    render: function (data, type, doc) {
                        let span
                        const customerType = (typeof data == 'undefined') ? 'public' : data.type
                        switch (customerType) {
                            case 'public':
                                span = `<span class="badge badge-light-success fw-bolder my-2">زبون عام</span>`

                                break;
                            case 'credit':
                                span = `<span class="badge badge-light-warning fw-bolder my-2">${data.name}</span>`

                                break;
                            case 'wholesaler':
                                span = `<span class="badge badge-light-info fw-bolder my-2">${data.name}</span>`

                                break;

                            default:
                                span = `<span class="badge badge-light fw-bolder my-2">زبون عام</span>`
                                break;
                        }
                        return span
                    }
                },
                {
                    data: 'products.length',
                },
                 {
                    data: 'totalProductsPrice',
                    render: function (data, type, doc) {
                        return `${data} شيكل`

                    }

                },
                {
                    data: 'discount',
                    render: function (data, type, doc) {
                        return `<span class="badge badge-light-${(data > 0) ?'success' : 'danger'} fw-bolder my-2">${(data > 0) ? `${data} شيكل` : 'لا يوجد'}</span>`

                    }

                },

                {
                    data: 'totalPrice',
                    render: function (data, type, doc) {
                        return `${data} شيكل`

                    }

                },
                {
                    data: 'paidAmount',
                    render: function (data, type, doc) {
                        return `${data} شيكل`

                    }

                },
                {
                    data: 'moneyBack',
                    render: function (data, type, doc) {
                        return `${data} شيكل`

                    }

                },

                {
                    data: '',
                    render: function (data, type, doc) {
                        return `<a href="#" class="btn btn-sm btn-light btn-active-light-primary"
                        data-kt-menu-trigger="click" data-kt-menu-placement="bottom-end"
                        data-kt-menu-flip="top-end">خيارات
                        <!--begin::Svg Icon | path: icons/duotune/arrows/arr072.svg-->
                        <span class="svg-icon svg-icon-5 m-0">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                viewBox="0 0 24 24" fill="none">
                                <path
                                    d="M11.4343 12.7344L7.25 8.55005C6.83579 8.13583 6.16421 8.13584 5.75 8.55005C5.33579 8.96426 5.33579 9.63583 5.75 10.05L11.2929 15.5929C11.6834 15.9835 12.3166 15.9835 12.7071 15.5929L18.25 10.05C18.6642 9.63584 18.6642 8.96426 18.25 8.55005C17.8358 8.13584 17.1642 8.13584 16.75 8.55005L12.5657 12.7344C12.2533 13.0468 11.7467 13.0468 11.4343 12.7344Z"
                                    fill="black" />
                            </svg>
                        </span>
                        <!--end::Svg Icon-->
                    </a>
                    <!--begin::Menu-->
                    <div class="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg-light-primary fw-bold fs-7 w-125px py-4"
                        data-kt-menu="true">
                        <!--begin::Menu item-->
                        <div class="menu-item px-3">
                         <a href="#" class="menu-link px-3">حذف</a>

                        </div>
                        <!--end::Menu item-->

                                      
                    </div>
                    <!--end::Menu-->`

                    }
                }

            ]
        });

        // Re-init functions on every table re-draw -- more info: https://datatables.net/reference/event/draw
        datatable.on('draw', function () {
            KTMenu.createInstances();
            handleDeleteRows();
        });
    }

    // Search Datatable --- official docs reference: https://datatables.net/reference/api/search()
    var handleSearchDatatable = () => {
        const filterSearch = document.querySelector('[data-kt-orders-table-filter="search"]');
        filterSearch.addEventListener('keyup', function (e) {
            tableQuery.search = e.target.value
            datatable.search(JSON.stringify(tableQuery)).draw();
        });
    }
    // Filter Datatable
    var handleFilter = function () {
        // Select filter options
        const filterForm = document.querySelector('[data-kt-orders-table-filter="form"]');
        const filterButton = filterForm.querySelector('[data-kt-orders-table-filter="filter"]');
        const resetButton = filterForm.querySelector('[data-kt-orders-table-filter="reset"]');
        const selectOptions = filterForm.querySelectorAll('select');
        const datepicker = filterForm.querySelector("[name=date]");

        // Filter datatable on submit
        filterButton.addEventListener('click', function () {
            let filter = {

            }
            // Get filter values
            selectOptions.forEach((item, index) => {
                if (item.value && item.value !== '') {
                    filter[item.id] = item.value
                }
            });
            if (datepicker.value && dateQuery) {
                filter.createdAt = dateQuery
            }
            tableQuery.filter = filter
            // Filter datatable --- official docs reference: https://datatables.net/reference/api/search()
            datatable.search(JSON.stringify(tableQuery)).draw();
        });

        // Reset datatable
        resetButton.addEventListener('click', function () {
            $(datepicker).val('')
            dateQuery = {}

            // Reset filter form
            selectOptions.forEach((item, index) => {
                // Reset Select2 dropdown --- official docs reference: https://select2.org/programmatic-control/add-select-clear-items
                $(item).val(null).trigger('change');
            });

            // Filter datatable --- official docs reference: https://datatables.net/reference/api/search()
            delete tableQuery.filter
            datatable.search(JSON.stringify(tableQuery)).draw();
        });



        // Handle datepicker range -- For more info on flatpickr plugin, please visit: https://flatpickr.js.org/
        $(function () {

            var start = moment().subtract(29, 'days');
            var end = moment();

            function cb(start, end) {
                dateQuery = {
                    $gte: moment(start).startOf('day').toDate(),
                    $lte: moment(end).endOf('day').toDate()
                }
                $('#reportrange span').html(start.format('DD/MM/YYYY') + ' - ' + end.format('DD/MM/YYYY'));
            }

            $(datepicker).daterangepicker({
                clearBtn: true,
                startDate: start,
                endDate: end,
                ranges: {
                    'اليوم': [moment(), moment()],
                    'الأمس': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                    'أخر 7 أيام': [moment().subtract(6, 'days'), moment()],
                    'أخر 30 يوم': [moment().subtract(29, 'days'), moment()],
                    'هذا الشهر': [moment().startOf('month'), moment().endOf('month')],
                    'الشهر الفائت': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
                },
                "locale": {
                    "format": "DD/MM/YYYY",
                    "separator": " - ",
                    "applyLabel": "تطبيق",
                    "cancelLabel": "إلغاء",
                    "fromLabel": "من",
                    "toLabel": "إلى",
                    "customRangeLabel": "تاريخ مخصص",
                }

            }, cb);
            $(datepicker).val('')

            cb(start, end);
            $("div.daterangepicker").click(function (e) {
                e.stopPropagation();
            });

        });



    }
    $(document).on('click', 'body .dropdown-menu', function (e) {
        e.stopPropagation();
    });
    // Delete orders
    var handleDeleteRows = () => {
        // Select all delete buttons
        const deleteButtons = table.querySelectorAll('[data-kt-orders-table-filter="delete_row"]');

        deleteButtons.forEach(d => {
            // Delete button on click
            d.addEventListener('click', function (e) {
                e.preventDefault();

                // Select parent row
                const parent = e.target.closest('tr');

                // Get orders name
                const ordersName = parent.querySelectorAll('td')[1].innerText;

                // SweetAlert2 pop up --- official docs reference: https://sweetalert2.github.io/
                Swal.fire({
                    text: "Are you sure you want to delete " + ordersName + "?",
                    icon: "warning",
                    showCancelButton: true,
                    buttonsStyling: false,
                    confirmButtonText: "Yes, delete!",
                    cancelButtonText: "No, cancel",
                    customClass: {
                        confirmButton: "btn fw-bold btn-danger",
                        cancelButton: "btn fw-bold btn-active-light-primary"
                    }
                }).then(function (result) {
                    if (result.value) {
                        Swal.fire({
                            text: "You have deleted " + ordersName + "!.",
                            icon: "success",
                            buttonsStyling: false,
                            confirmButtonText: "Ok, got it!",
                            customClass: {
                                confirmButton: "btn fw-bold btn-primary",
                            }
                        }).then(function () {
                            // Remove current row
                            datatable.row($(parent)).remove().draw();
                        });
                    } else if (result.dismiss === 'cancel') {
                        Swal.fire({
                            text: ordersName + " was not deleted.",
                            icon: "error",
                            buttonsStyling: false,
                            confirmButtonText: "Ok, got it!",
                            customClass: {
                                confirmButton: "btn fw-bold btn-primary",
                            }
                        });
                    }
                });
            })
        });
    }




    // Public methods
    return {


        init: function () {
            table = document.querySelector('#kt_orders_table');


            if (!table) {
                return;
            }

            initordersList();
            handleSearchDatatable();
            handleDeleteRows();
            handleFilter();


        }
    }
}();

// On document ready
KTUtil.onDOMContentLoaded(function () {
    KTOrdersList.init();

});