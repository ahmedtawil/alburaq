
// Class definition
var KTModalOrderAdd = function () {
    var submitButton;
    var cancelButton;
    var closeButton;
    var validator;
    var form;
    const importData = {
        productCategories: [],
        totalProductCategoriesPrice: 0,
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

            // Validate form before submit
            if (validator) {
                validator.validate().then(function (status) {
                    console.log('validated!');

                    if (status == 'Valid') {
                        submitButton.setAttribute('data-kt-indicator', 'on');

                        // Disable submit button whilst loading
                        submitButton.disabled = true;
                        const payload = {
                            supplier: $('select[name="supplier"]').val(),
                            ...importData
                        }

                        $.post('/import/new', { payload: JSON.stringify(payload) }).then(recipientID => {
                            submitButton.removeAttribute('data-kt-indicator');

                            Swal.fire({
                                text: "تم إضافة التوريد بنجاح!",
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
                                    window.location = '/import/new'

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
            const productCategory = importData.productCategories[index]
            $(`#qty-${productCategory._id}`).val(productCategory.qty)
            $(`#costPrice-${productCategory._id}`).val(productCategory.costPrice)
            $(`#sellingPrice-${productCategory._id}`).val(productCategory.sellingPrice)
            row.find('td').eq(4).html(productCategory.totalPrice)
            updateImportResult()
        }


        const addProductCategory = (productCategory) => {
            const existIndex = importData.productCategories.findIndex(prod => prod._id == productCategory._id)
            if (existIndex >= 0) {
                importData.productCategories[existIndex].qty++
                importData.productCategories[existIndex].totalPrice += productCategory.costPrice 
                updateRow(existIndex)
                return
            }
            const newProductCategory = {
                _id: productCategory._id,
                name: `${productCategory.name} - ${productCategory.unit.title}`,
                qty: 1,
                costPrice: productCategory.costPrice,
                sellingPrice:productCategory.sellingPrice,
                totalPrice: productCategory.costPrice,
            }
            
            importData.productCategories.push(newProductCategory)
            updateImportResult()

            const tr = document.createElement('tr')
            tr.setAttribute("id", `item-${importData.productCategories.indexOf(newProductCategory)}`);

            tr.innerHTML = `
            <td>${newProductCategory.name}</td>
            <td><input type="number" class="form-control form-control-solid productCategoryQty" id="qty-${newProductCategory._id}" value="${newProductCategory.qty}" min="1"></td>
            <td><input type="number" class="form-control form-control-solid productCategoryCostPrice" id="costPrice-${newProductCategory._id}" value="${newProductCategory.costPrice}" min="1"></td>
            <td><input type="number" class="form-control form-control-solid productCategorySellingPrice" id="sellingPrice-${newProductCategory._id}" value="${newProductCategory.sellingPrice}" min="1"></td>
            <td>${newProductCategory.totalPrice}</td>
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
            form.querySelector('#import_tbody').appendChild(tr);


            $('.productCategoryQty').on('change keyup', async function (event) { 
                const val = $(this).val().trim()
                const id = $(this).attr("id").split('-')[1]
                const productCategoryIndex = importData.productCategories.findIndex(productCategory => productCategory._id == id)
                importData.productCategories[productCategoryIndex].qty = Number(val)
                importData.productCategories[productCategoryIndex].totalPrice = importData.productCategories[productCategoryIndex].qty * importData.productCategories[productCategoryIndex].costPrice
                updateRow(productCategoryIndex)
            })

            $('.productCategoryCostPrice').on('change keyup', async function (event) {
                const val = $(this).val().trim()
                const id = $(this).attr("id").split('-')[1]
                const productCategoryIndex = importData.productCategories.findIndex(productCategory => productCategory._id == id)
                importData.productCategories[productCategoryIndex].costPrice = Number(val)
                importData.productCategories[productCategoryIndex].totalPrice = importData.productCategories[productCategoryIndex].qty * val
                updateRow(productCategoryIndex)
            })

            $('.productCategorySellingPrice').on('change keyup', async function (event) {
                const val = $(this).val().trim()
                const id = $(this).attr("id").split('-')[1]
                const productCategoryIndex = importData.productCategories.findIndex(productCategory => productCategory._id == id)
                importData.productCategories[productCategoryIndex].sellingPrice = Number(val)
            })

          
            deleteCustomField()

        }

        const getProuctBySerialNumber = async (serialNumber = 00000000) => {
            const res = await fetch(`/productCategory/get?serialNumber=${serialNumber}`) 
            const data = await res.json()
            return data.productCategory
        }

        $('#productCategorySerialNumber').on('keyup', async function (event) {
            if (event.which === 13) {
                event.preventDefault();
                const val = $(this).val().trim()
                const productCategory = await getProuctBySerialNumber(val)
                if (!productCategory) {
                    return
                }
                addProductCategory(productCategory)
                $(this).val('')
            }

        })
        $('#productCategories').on('change', async function (event) {
            const val = $(this).val().trim()
            const productCategory = await getProuctBySerialNumber(val)
            if (!productCategory) {
                return
            }
            addProductCategory(productCategory)
            $(this).val('')
        })



    }
    // Delete productCategory
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

                        importData.productCategories.splice(index, 1)
                        $(`#${rowId}`).remove();

                        $('#orderTbody > tr').each(function (index, tr) {
                            $(this).attr("id", `item-${index}`)
                        });
                        updateImportResult()

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

    const updateImportResult = () => {
        const totalProductCategoriesPrice = claTotalProductCategoriesPrice()
        importData.totalProductCategoriesPrice = totalProductCategoriesPrice
        $('#new_total_price_result').html(`${totalProductCategoriesPrice} شيكل`)

        const discount = importData.discount
        $('#new_discount_amount_result').html(`${discount} شيكل`)


        const paid_amount = importData.paidAmount
        $('#new_paid_amount_result').html(`${paid_amount} شيكل`)



        const totalAmount = totalProductCategoriesPrice - discount
        importData.totalPrice = totalAmount
        $('#new_total_amount_result').html(`${totalAmount} شيكل`)

        const paid_amount_back = paid_amount - totalAmount
        importData.moneyBack = paid_amount_back
        $('#new_paid_amount_back_result').html(`${paid_amount_back} شيكل`)
    }

    const claTotalProductCategoriesPrice = () => {
        const total = importData.productCategories.reduce((acc, productCategory) => acc + productCategory.totalPrice, 0)
        return total
    }

    $('#new_discount').on('change keyup', function (e) {
        const val = $(this).val().trim()
        importData.discount = val
        updateImportResult()
    })

    $('#new_paid_amount').on('change keyup', function (e) {
        const val = $(this).val().trim()
        importData.paidAmount = val
        importData.moneyBack = importData.totalPrice - importData.paidAmount
        updateImportResult()
    })

    const checkValidPaidAmount = function () {
        return {
            validate: function (input) {
                const value = input.value;

                if ( value > importData.totalPrice) {
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

                if (value > importData.totalProductCategoriesPrice) {
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

            form = document.querySelector('#kt_modal_add_import_form');
            submitButton = form.querySelector('#kt_modal_add_import_submit');
            cancelButton = form.querySelector('#kt_modal_add_import_cancel');



            handleForm();
            deleteCustomField();
        }
    };
}();




$(document).ready(function () {
    $('#productCategorySerialNumber').focus()
    $(window).keydown(function (event) {
        if (event.keyCode == 13) {
            event.preventDefault();
            return false;
        }
    });
});


// On document ready
KTUtil.onDOMContentLoaded(function () {

    KTModalOrderAdd.init();
});

