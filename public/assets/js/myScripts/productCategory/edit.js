"use strict";
// Class definition
let isWeightUnit = false
let internalProductCategorySerialNumber = false
let internalProductSerialNumber = false
let addProduct = false
let productCategoryID
let productID
let productCategorySerialNumber
let productIDSerialNumber



var KTModalProductCategoryEdit = function () {
    var submitButton;
    var cancelButton;
    var closeButton;
    var validator;
    var form;
    var modal;



    // Init form inputs
    var handleForm = function () {
        // Init form validation rules. For more info check the FormValidation plugin's official documentation:https://formvalidation.io/
        const checkIfProductCategorySerialNumberRequired = function () {
            return {
                validate: function (input) {
                    const value = input.value;

                    if (internalProductCategorySerialNumber) {
                        return {
                            valid: true,
                        };
                    } else if (value.length > 0) {
                        return {
                            valid: true,
                        };
                    } else {
                        return {
                            valid: false,
                        };
                    }

                },
            };
        };

        const checkIfProductSerialNumberRequired = function () {
            return {
                validate: function (input) {
                    const value = input.value;
                    if (!addProduct) {
                        return {
                            valid: true,
                        };
                    } else if (internalProductSerialNumber) {
                        return {
                            valid: true,
                        };
                    } else if (value.length > 0) {
                        return {
                            valid: true,
                        };
                    } else {
                        return {
                            valid: false,
                        };
                    }
                },
            };
        };

        const checkIfProductSellingPriceRequired = function () {
            return {
                validate: function (input) {
                    const value = input.value;
                    if (!addProduct) {
                        return {
                            valid: true,
                        };
                    } else if (isWeightUnit) {
                        return {
                            valid: true,
                        };
                    } else if (value.length > 0) {
                        return {
                            valid: true,
                        };
                    } else {
                        return {
                            valid: false,
                        };
                    }
                },
            };
        };



        FormValidation.validators.checkIfProductCategorySerialNumberRequired = checkIfProductCategorySerialNumberRequired;
        FormValidation.validators.checkIfProductSerialNumberRequired = checkIfProductSerialNumberRequired;
        FormValidation.validators.checkIfProductSellingPriceRequired = checkIfProductSellingPriceRequired;
        FormValidation.validators.checkIfProductSerialNumberExist = checkIfProductSerialNumberExist;
        FormValidation.validators.checkIfProductCategorySerialNumberExist = checkIfProductCategorySerialNumberExist;


        validator = FormValidation.formValidation(
            form,
            {
                fields: {
                    'edit_name': {
                        validators: {
                            notEmpty: {
                                message: '?????? ?????????? ??????????'
                            }
                        }
                    },
                    'edit_productCategory': {
                        validators: {
                            notEmpty: {
                                message: '???????? ?????????? ????????????.'
                            }

                        }
                    },
                    'edit_qty': {
                        validators: {
                            notEmpty: {
                                message: '???????????? ????????????.'
                            }

                        }
                    },
                    'edit_productCategorySerialNumber': {
                        validators: {
                            checkIfProductCategorySerialNumberRequired: {
                                message: '???????????????? ???????? ?????????? ??????????.'
                            },
                            checkIfProductCategorySerialNumberExist: {
                                message: '?????? ?????????? ???? ???????????????? ???????? ?????????? ????????????'
                            }

                        }
                    }
                    ,
                    'edit_productCategorySellingPrice': {
                        validators: {
                            notEmpty: {
                                message: '?????? ?????????? ?????????? ??????????.'
                            }

                        }
                    },

                    'edit_costPrice': {
                        validators: {
                            notEmpty: {
                                message: '?????? ?????????????? ?????????? ??????????.'
                            }

                        }
                    },
                    'edit_supplier': {
                        validators: {
                            notEmpty: {
                                message: '???????? ?????????? ??????????'
                            }

                        }
                    },
                    'edit_productSerialNumber': {
                        validators: {
                            checkIfProductSerialNumberRequired: {
                                message: '???????????????? ???????? ???????????? ??????????.'
                            },
                            checkIfProductSerialNumberExist: {
                                message: '?????? ???????????? ???? ???????????????? ???????? ?????????? ????????????'
                            }
                        }
                    },
                    'edit_productSellingPrice': {

                        validators: {
                            checkIfProductSellingPriceRequired: {
                                message: '?????? ?????? ???????????? ???????????? ?????????????? ??????????'

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
                            name: $("input[name=edit_name]").val(),
                            unit: $("select[name=edit_unit]").val(),
                            qty: $("input[name=edit_qty]").val(),
                            productCategorySerialNumber: $("input[name=edit_productCategorySerialNumber]").val(),
                            productCategoryCostPrice: $("input[name=edit_costPrice]").val(),
                            productCategorySellingPrice: $("input[name=edit_productCategorySellingPrice]").val(),
                            supplier: $("select[name=edit_supplier]").val(),

                            productSerialNumber: $("input[name=edit_productSerialNumber]").val(),
                            productSellingPrice: $("input[name=edit_productSellingPrice]").val(),

                            configs: {
                                addProduct,
                                internalProductSerialNumber,
                                internalProductCategorySerialNumber,
                                isWeightUnit
                            }

                        }

                        $.post(`/productCategory/edit/${productCategoryID}`, { payload: JSON.stringify(payload) }).then(recipientID => {
                            submitButton.removeAttribute('data-kt-indicator');

                            Swal.fire({
                                text: "???? ?????????? ?????????? ??????????!",
                                icon: "success",
                                buttonsStyling: false,
                                confirmButtonText: "????????",
                                customClass: {
                                    confirmButton: "btn btn-primary"
                                }
                            }).then(function (result) {
                                if (result.isConfirmed) {
                                    // Hide modal
                                    modal.hide();

                                    // Enable submit button after loading
                                    submitButton.disabled = false;
                                    form.reset();
                                    window.location = '/productCategories/page/get'

                                }
                            })
                        }).catch(err => {
                            Swal.fire({
                                text: errDisplay(err),
                                icon: "error",
                                buttonsStyling: false,
                                confirmButtonText: "????????",
                                customClass: {
                                    confirmButton: "btn btn-primary"
                                }
                            });
                            form.reset();
                            submitButton.removeAttribute('data-kt-indicator');
                            submitButton.disabled = false;
                        })

                    } else {
                        Swal.fire({
                            text: "?????? ?????? ???? ?? ???????? ???????????????? ?????? ????????!",
                            icon: "error",
                            buttonsStyling: false,
                            confirmButtonText: "????????",
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
                text: "???? ???????? ?????????? ?????????????? ??",
                icon: "warning",
                showCancelButton: true,
                buttonsStyling: false,
                confirmButtonText: "??????",
                cancelButtonText: "????",
                customClass: {
                    confirmButton: "btn btn-primary",
                    cancelButton: "btn btn-active-light"
                }
            }).then(function (result) {
                if (result.value) {
                    form.reset(); // Reset form	
                    modal.hide(); // Hide modal	
                } else if (result.dismiss === 'cancel') {
                    Swal.fire({
                        text: "???? ?????? ?????????? ?????????? ??????????????!",
                        icon: "error",
                        buttonsStyling: false,
                        confirmButtonText: "????????",
                        customClass: {
                            confirmButton: "btn btn-primary",
                        }
                    });
                }
            });
        });

        closeButton.addEventListener('click', function (e) {
            e.preventDefault();

            Swal.fire({
                text: "???? ?????? ?????????? ???? ?????????? ?????????????? ??",
                icon: "warning",
                showCancelButton: true,
                buttonsStyling: false,
                confirmButtonText: "??????",
                cancelButtonText: "????",
                customClass: {
                    confirmButton: "btn btn-primary",
                    cancelButton: "btn btn-active-light"
                }
            }).then(function (result) {
                if (result.value) {
                    form.reset(); // Reset form	
                    modal.hide(); // Hide modal	

                } else if (result.dismiss === 'cancel') {
                    Swal.fire({
                        text: "???? ?????? ?????????? ??????????????!",
                        icon: "error",
                        buttonsStyling: false,
                        confirmButtonText: "????????",
                        customClass: {
                            confirmButton: "btn btn-primary",
                        }
                    });
                }
            });
        })

        $('#edit_unit').on('change', function (e) {
            const selectedUnit = $(this).find('option:selected').attr('unit')
            if (selectedUnit == 'weight') {
                $('#edit_productSellingPriceBlock').addClass('d-none')
                isWeightUnit = true
            } else {
                $('#edit_productSellingPriceBlock').removeClass('d-none')
                isWeightUnit = false
            }
        })

        $('#edit_productCategorySerialNumberBtn').on('change', function (e) {
            if (this.checked) {
                $('#edit_productCategorySerialNumberBlock').addClass('d-none')
                internalProductCategorySerialNumber = true
            } else {
                $('#edit_productCategorySerialNumberBlock').removeClass('d-none')
                internalProductCategorySerialNumber = false
            }
        })
        $('#edit_addProduct').on('change', function (e) {
            if (this.checked) {
                $('#edit_productBlock').removeClass('d-none')
                addProduct = true
            } else {
                $('#edit_productBlock').addClass('d-none')
                addProduct = false
            }
        })


        $('#edit_productSerialNumberBtn').on('change', function (e) {
            if (this.checked) {
                $('#edit_productSerialNumberBlock').addClass('d-none')
                internalProductSerialNumber = true
            } else {
                $('#edit_productSerialNumberBlock').removeClass('d-none')
                internalProductSerialNumber = true
            }
        })

        $("#edit_unit , #edit_supplier").select2({
            dropdownParent: $("#kt_modal_edit_productCategory")
        });




    }

    return {
        // Public functions
        init: function () {
            // Elements
            modal = new bootstrap.Modal(document.querySelector('#kt_modal_edit_productCategory'));

            form = document.querySelector('#kt_modal_edit_productCategory_form');
            submitButton = form.querySelector('#kt_modal_edit_productCategory_submit');
            cancelButton = form.querySelector('#kt_modal_edit_productCategory_cancel');
            closeButton = form.querySelector('#kt_modal_edit_productCategory_close');



            handleForm();
        }
    };
}();

let checkIfProductSerialNumberExist
let checkIfProductCategorySerialNumberExist
const linkEventsTriggers = () => {
    $('.edit').on('click', async function (e) {
        e.preventDefault()
        const id = e.target.id
        const res = await fetch(`/productCategory/edit/data/get/${id}`)
        const { productCategory, product, configs } = await res.json()
        addProduct = configs.addProduct
        isWeightUnit = configs.isWeightUnit
        productCategoryID = productCategory._id
        productCategorySerialNumber = productCategory.serialNumber
        productIDSerialNumber = (addProduct && !isWeightUnit) ? product.serialNumber : null

        $("input[name=edit_name]").val(productCategory.name)
        $("#edit_unit").val(productCategory.unit._id).change()
        $("input[name=edit_qty]").val(productCategory.qty.toFixed(2))
        $("input[name=edit_productCategorySerialNumber]").val(productCategory.serialNumber)
        $("input[name=edit_costPrice]").val(productCategory.costPrice)
        $("input[name=edit_productCategorySellingPrice]").val(productCategory.sellingPrice)
        $("select[name=edit_supplier]").val(productCategory.supplier).change()

        if (addProduct) {
            $('#edit_productBlock').removeClass('d-none')
            $('#edit_addProduct').prop('checked', true);
            $("input[name=edit_productSerialNumber]").val(product.serialNumber)
            $("input[name=edit_productSellingPrice]").val(product.price)
        }

        checkIfProductSerialNumberExist = function () {
            return {
                validate: function (input) {
                    const value = input.value;
                    if (!internalProductSerialNumber) {
                        return $.get(`/product/checkSerialNumber/${value || productSerialNumber}?productCategoryID=${productCategoryID}`).then((data, statusCode) => {

                            if (data.isExisted) {
                                return {
                                    valid: false,
                                };
                            } else {
                                return {
                                    valid: true,
                                };
                            }

                        }).catch(console.log)
                    }

                },
            };
        };
        checkIfProductCategorySerialNumberExist = function () {
            return {
                validate: function (input) {
                    const value = input.value;
                    if (!internalProductCategorySerialNumber) {
                        return $.get(`/productCategory/checkSerialNumber/${value || productCategorySerialNumber}?productID=${productID}`).then((data, statusCode) => {

                            if (data.isExisted) {
                                return {
                                    valid: false,
                                };
                            } else {
                                return {
                                    valid: true,
                                };
                            }

                        }).catch(console.log)
                    }

                },
            };
        };

        $('#kt_modal_edit_productCategory').modal('show');

    })

}





// On document ready
KTUtil.onDOMContentLoaded(function () {

    KTModalProductCategoryEdit.init();
});

