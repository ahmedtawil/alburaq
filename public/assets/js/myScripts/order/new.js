
// Class definition
var KTModalOrderAdd = function () {
    var submitButton;
    var cancelButton;
    var closeButton;
    var validator;
    var form;
    const orderData = {
        products: [],
        totalProductsPrice: 0,
        discount: 0,
        paidAmount: 0,
        totalPrice: 0,
        moneyBack: 0
    }

    // Init form inputs
    var handleForm = function () {
        // Init form validation rules. For more info check the FormValidation plugin's official documentation:https://formvalidation.io/

        FormValidation.validators.checkValidPaidAmount = checkValidPaidAmount
        FormValidation.validators.checkValidDiscount = checkValidDiscount


        validator = FormValidation.formValidation(
            form,
            {
                fields: {
                    'new_paid_amount': {
                        validators: {
                            checkValidPaidAmount: {
                                message: 'لا يمكن ان يتجاوز المطلوب للدفع'
                            }
                        }
                    },
                    'new_discount': {
                        validators: {
                            checkValidDiscount: {
                                message: ' لا يمكن أن يتجاوز الخصم المبلغ الإجمالي'
                            }
                        }
                    }
                },
                plugins: {
                    trigger: new FormValidation.plugins.Trigger(),
                    bootstrap: new FormValidation.plugins.Bootstrap5({
                        rowSelector: '.fv-row',
                        eleInvalidClass: '',
                        eleValidClass: ''
                    })
                }
            }
        );/*

		// Revalidate country field. For more info, plase visit the official plugin site: https://select2.org/
        $(form.querySelector('[name="country"]')).on('change', function() {
            // Revalidate the field when an option is chosen
            validator.revalidateField('country');
        });
        */
        // Action buttons
        submitButton.addEventListener('click', function (e) {
            e.preventDefault();
            if(orderData.products.length == 0){
                return  Swal.fire({
                    text: "الطلبية فارغة.!",
                    icon: "error",
                    buttonsStyling: false,
                    confirmButtonText: "حسنا",
                    customClass: {
                        confirmButton: "btn btn-primary"
                    }
                });
            }

            // Validate form before submit
            if (validator) {
                validator.validate().then(function (status) {
                    console.log('validated!');

                    if (status == 'Valid') {
                        submitButton.setAttribute('data-kt-indicator', 'on');

                        // Disable submit button whilst loading
                        submitButton.disabled = true;
                        const payload = {
                            customer: $('select[name="customer"]').val(),
                            ...orderData
                        }

                        $.post('/order/new', { payload: JSON.stringify(payload) }).then(invoice => {
                            submitButton.removeAttribute('data-kt-indicator');

                            Swal.fire({
                                text: "تم إضافة الطلبية بنجاح!",
                                icon: "success",
                                buttonsStyling: false,
                                confirmButtonText: "حسنا",
                                customClass: {
                                    confirmButton: "btn btn-primary"
                                }
                            }).then(function (result) {
                                if (result.isConfirmed) {
                                    // Hide modal

                                    // Enable submit button after loading
                                    submitButton.disabled = false;
                                    printInvoice(this, {_id:invoice._id})

                                }
                            })
                        }).catch(err => {
                            Swal.fire({
                                text: errDisplay(err),
                                icon: "error",
                                buttonsStyling: false,
                                confirmButtonText: "حسنا",
                                customClass: {
                                    confirmButton: "btn btn-primary"
                                }
                            });

                            submitButton.removeAttribute('data-kt-indicator');
                            submitButton.disabled = false;


                        })

                    } else {
                        Swal.fire({
                            text: "حصل خطأ ما ، يرجى المحاولة مرة أخرى!",
                            icon: "error",
                            buttonsStyling: false,
                            confirmButtonText: "حسنا",
                            customClass: {
                                confirmButton: "btn btn-primary"
                            }
                        });
                        submitButton.removeAttribute('data-kt-indicator');

                    }
                });
            }
        });

        cancelButton.addEventListener('click', function (e) {
            e.preventDefault();

            Swal.fire({
                text: "هل تريد إلغاء العملية ؟",
                icon: "warning",
                showCancelButton: true,
                buttonsStyling: false,
                confirmButtonText: "نعم",
                cancelButtonText: "لا",
                customClass: {
                    confirmButton: "btn btn-primary",
                    cancelButton: "btn btn-active-light"
                }
            }).then(function (result) {
                if (result.value) {
                    form.reset(); // Reset form	
                    // modal.hide(); // Hide modal	
                    window.location = '/order/new'
                } else if (result.dismiss === 'cancel') {
                    Swal.fire({
                        text: "لم يتم إلغاء نموذج الإضافة!",
                        icon: "error",
                        buttonsStyling: false,
                        confirmButtonText: "حسنا",
                        customClass: {
                            confirmButton: "btn btn-primary",
                        }
                    });
                }
            });
        });

        const updateRow = (index) => {
            const row = $(`#item-${index}`)
            const product = orderData.products[index]
            $(`#${product._id}`).val(product.qty)
            row.find('td').eq(2).html(product.price)
            row.find('td').eq(3).html(product.Totalprice)
            updateOrderResults()
        }


        const addProduct = (product) => {
            const existIndex = orderData.products.findIndex(prod => prod._id == product._id)
            if (existIndex >= 0) {
                if (!product.takePrice) {
                    return
                }
                orderData.products[existIndex].qty++
                orderData.products[existIndex].Totalprice += product.price
                updateRow(existIndex)
                return
            }
            const newProduct = {
                _id: product._id,
                name: product.name,
                qty: 1,
                price: product.price || 0,
                Totalprice: product.price || 0,
                manualPrice: false

            }
            if (!product.takePrice) {
                newProduct.price = 1
                newProduct.Totalprice = 1
                newProduct.manualPrice = true
            }
            orderData.products.push(newProduct)
            updateOrderResults()

            const tr = document.createElement('tr')
            tr.setAttribute("id", `item-${orderData.products.indexOf(newProduct)}`);

            tr.innerHTML = `
            <td>${newProduct.name}</td>
            <td>${(newProduct.manualPrice != true) ? `<input type="number" class="form-control form-control-solid productQty" id="${newProduct._id}" value="${newProduct.qty}" min="1">` : `-`}</td>
            <td>${(newProduct.manualPrice != true) ? newProduct.price : `<input type="number" class="form-control form-control-solid weightProduct" id="${newProduct._id}" value="1" min="1">`}</td>
            <td>${(newProduct.manualPrice != true) ? newProduct.Totalprice : 1}</td>
            <td><button type="button" class="btn btn-icon btn-flex btn-active-light-primary w-30px h-30px me-3 add_delete_row" >
            <!--begin::Svg Icon | path: icons/duotune/general/gen027.svg-->
            <span class="svg-icon svg-icon-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M5 9C5 8.44772 5.44772 8 6 8H18C18.5523 8 19 8.44772 19 9V18C19 19.6569 17.6569 21 16 21H8C6.34315 21 5 19.6569 5 18V9Z" fill="black"></path>
                    <path opacity="0.5" d="M5 5C5 4.44772 5.44772 4 6 4H18C18.5523 4 19 4.44772 19 5V5C19 5.55228 18.5523 6 18 6H6C5.44772 6 5 5.55228 5 5V5Z" fill="black"></path>
                    <path opacity="0.5" d="M9 4C9 3.44772 9.44772 3 10 3H14C14.5523 3 15 3.44772 15 4V4H9V4Z" fill="black"></path>
                </svg>
            </span>
            <!--end::Svg Icon-->
            </button></td>`
            form.querySelector('#orderTbody').appendChild(tr);


            $('.productQty').on('change keyup', async function (event) {
                const val = $(this).val().trim()
                const id = $(this).attr("id")
                const productIndex = orderData.products.findIndex(product => product._id == id)
                orderData.products[productIndex].qty = val
                orderData.products[productIndex].Totalprice = orderData.products[productIndex].qty * orderData.products[productIndex].price
                updateRow(productIndex)
            })

            $('.weightProduct').on('change keyup', async function (e) {
                const val = $(this).val().trim()
                const id = $(this).attr("id")
                const res = await fetch(`/product/productCategory/${id}/get`)
                const { product } = await res.json()
                const productIndex = orderData.products.findIndex(product => product._id == id)
                orderData.products[productIndex].qty = 1
                orderData.products[productIndex].price = val
                orderData.products[productIndex].Totalprice = orderData.products[productIndex].qty * val
                const row = $(e.target.closest('tr'));

                row.find('td').eq(3).html(orderData.products[productIndex].Totalprice)
                updateOrderResults()
            })
            deleteCustomField()

        }

        const getProuctBySerialNumber = async (serialNumber = 00000000) => {
            const res = await fetch(`/product/get?serialNumber=${serialNumber}`)
            const data = await res.json()
            return data.product
        }

        $('#productSerialNumber').on('keyup', async function (event) {
            if (event.which === 13) {
                event.preventDefault();
                const val = $(this).val().trim()
                const product = await getProuctBySerialNumber(val)
                if (!product) {
                    $(this).val('')
                    return  Swal.fire({
                        text: "لم يتم العثور على المنتج!",
                        icon: "error",
                        buttonsStyling: false,
                        confirmButtonText: "حسنا",
                        customClass: {
                            confirmButton: "btn btn-primary"
                        }
                    });
                }
                addProduct(product)
                $(this).val('')
            }

        })
        $('#products').on('change', async function (event) {
            const val = $(this).val().trim()
            const product = await getProuctBySerialNumber(val)
            if (!product) {
                return
            }
            addProduct(product)
            $(this).val('')
        })



    }
    // Delete product
    var deleteCustomField = function () {

        $('.add_delete_row').on('click', function (e) {
            e.preventDefault();

            // Select parent row
            const row = e.target.closest('tr');

            // SweetAlert2 pop up --- official docs reference: https://sweetalert2.github.io/

            Swal.fire({
                text: "هل تريد حذف المنتج ؟",
                icon: "warning",
                showCancelButton: true,
                buttonsStyling: false,
                confirmButtonText: "نعم",
                cancelButtonText: "لا",
                customClass: {
                    confirmButton: "btn fw-bold btn-danger",
                    cancelButton: "btn fw-bold btn-active-light-primary"
                }
            }).then(function (result) {
                if (result.value) {
                    Swal.fire({
                        text: "تم الحذف بنجاح.",
                        icon: "success",
                        buttonsStyling: false,
                        confirmButtonText: "موافق",
                        customClass: {
                            confirmButton: "btn fw-bold btn-primary",
                        }
                    }).then(function () {
                        // Remove current row
                        const rowId = $(row).attr("id")
                        const index = rowId.split('-')[1]

                        orderData.products.splice(index, 1)
                        $(`#${rowId}`).remove();

                        $('#orderTbody > tr').each(function (index, tr) {
                            $(this).attr("id", `item-${index}`)
                        });
                        updateOrderResults()

                    });
                } else if (result.dismiss === 'cancel') {
                    Swal.fire({
                        text: "لم يتم الحذف بنجاح",
                        icon: "error",
                        buttonsStyling: false,
                        confirmButtonText: "حسناً",
                        customClass: {
                            confirmButton: "btn fw-bold btn-primary",
                        }
                    })
                }
            });
        })

    }

    const updateOrderResults = () => {
        const totalProductsPrice = claTotalProductsPrice()
        orderData.totalProductsPrice = totalProductsPrice
        $('#new_total_price_result').html(`${totalProductsPrice} شيكل`)

        const discount = orderData.discount
        $('#new_discount_amount_result').html(`${discount} شيكل`)


        const paid_amount = orderData.paidAmount
        $('#new_paid_amount_result').html(`${paid_amount} شيكل`)



        const totalAmount = totalProductsPrice - discount
        orderData.totalPrice = totalAmount
        $('#new_total_amount_result').html(`${totalAmount} شيكل`)

        const paid_amount_back = paid_amount - totalAmount
        orderData.moneyBack = paid_amount_back
        $('#new_paid_amount_back_result').html(`${paid_amount_back} شيكل`)
    }

    const claTotalProductsPrice = () => {
        const total = orderData.products.reduce((acc, product) => acc + product.Totalprice, 0)
        return total
    }

    $('#new_discount').on('change keyup', function (e) {
        const val = $(this).val().trim()
        orderData.discount = val
        updateOrderResults()
    })

    $('#new_paid_amount').on('change keyup', function (e) {
        const val = $(this).val().trim()
        orderData.paidAmount = val
        orderData.moneyBack = orderData.totalPrice - orderData.paidAmount
        updateOrderResults()
    })

    const checkValidPaidAmount = function () {
        return {
            validate: function (input) {
                const value = input.value;
                const customer = $('select[name="customer"]').val()

                if (customer !== 'public' && value > orderData.totalPrice) {
                    return {
                        valid: false,
                    };
                } else {
                    return {
                        valid: true,
                    };
                }


            },
        };
    };

    const checkValidDiscount = function () {
        return {
            validate: function (input) {
                const value = input.value;
                const customer = $('select[name="customer"]').val()

                if (value > orderData.totalProductsPrice) {
                    return {
                        valid: false,
                    };
                } else {
                    return {
                        valid: true,
                    };
                }


            },
        };
    };



    return {
        // Public functions
        init: function () {
            // Elements

            form = document.querySelector('#kt_modal_add_order_form');
            submitButton = form.querySelector('#kt_modal_add_order_submit');
            cancelButton = form.querySelector('#kt_modal_add_order_cancel');



            handleForm();
            deleteCustomField();
        }
    };
}();




$(document).ready(function () {
    $('#productSerialNumber').focus()
    $(window).keydown(function (event) {
        if (event.keyCode == 13 || event.keyCode == 27) {
            event.preventDefault();
            return false;
        }
    });
});


// On document ready
KTUtil.onDOMContentLoaded(function () {

    KTModalOrderAdd.init();
});

