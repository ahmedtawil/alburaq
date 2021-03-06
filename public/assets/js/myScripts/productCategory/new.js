"use strict";
// Class definition
var KTModalProductCategoryAdd = function () {
    var submitButton;
    var cancelButton;
    var closeButton;
    var validator;
    var form;
    var modal;

    let isWeightUnit = false
    let internalProductCategorySerialNumber = false
    let internalProductSerialNumber = false
    let addProduct = false


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
        const checkIfProductSerialNumberExist = function () {
            return {
                validate: function (input) {
                    const value = input.value;
                    if (!internalProductSerialNumber) {
                        return $.get(`/product/checkSerialNumber/${value}`).then((data, statusCode) => {

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
        const checkIfProductCategorySerialNumberExist = function () {
            return {
                validate: function (input) {
                    const value = input.value;
                    if (!internalProductCategorySerialNumber) {
                        return $.get(`/productCategory/checkSerialNumber/${value}`).then((data, statusCode) => {

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



        FormValidation.validators.checkIfProductCategorySerialNumberRequired = checkIfProductCategorySerialNumberRequired;
        FormValidation.validators.checkIfProductSerialNumberRequired = checkIfProductSerialNumberRequired;
        FormValidation.validators.checkIfProductSellingPriceRequired = checkIfProductSellingPriceRequired;
        FormValidation.validators.checkIfProductSerialNumberExist = checkIfProductSerialNumberExist;
        FormValidation.validators.checkIfProductCategorySerialNumberExist = checkIfProductCategorySerialNumberExist;


        validator = FormValidation.formValidation(
            form,
            {
                fields: {
                    'name': {
                        validators: {
                            notEmpty: {
                                message: '?????? ?????????? ??????????'
                            }
                        }
                    },
                    'productCategory': {
                        validators: {
                            notEmpty: {
                                message: '???????? ?????????? ????????????.'
                            }

                        }
                    },
                    'qty': {
                        validators: {
                            notEmpty: {
                                message: '???????????? ????????????.'
                            }

                        }
                    },
                    'productCategorySerialNumber': {
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
                    'productCategorySellingPrice': {
                        validators: {
                            notEmpty: {
                                message: '?????? ?????????? ?????????? ??????????.'
                            }

                        }
                    },

                    'costPrice': {
                        validators: {
                            notEmpty: {
                                message: '?????? ?????????????? ?????????? ??????????.'
                            }

                        }
                    },
                    'supplier': {
                        validators: {
                            notEmpty: {
                                message: '???????? ?????????? ??????????'
                            }

                        }
                    },
                    'productSerialNumber': {
                        validators: {
                            checkIfProductSerialNumberRequired: {
                                message: '???????????????? ???????? ???????????? ??????????.'
                            },
                            checkIfProductSerialNumberExist: {
                                message: '?????? ???????????? ???? ???????????????? ???????? ?????????? ????????????'
                            }
                        }
                    },
                    'productSellingPrice': {

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
                            name: $("input[name=name]").val(),
                            unit: $("select[name=unit]").val(),
                            qty: $("input[name=qty]").val(),
                            productCategorySerialNumber: $("input[name=productCategorySerialNumber]").val(),
                            productCategoryCostPrice: $("input[name=costPrice]").val(),
                            productCategorySellingPrice: $("input[name=productCategorySellingPrice]").val(),
                            supplier: $("select[name=supplier]").val(),

                            productSerialNumber: $("input[name=productSerialNumber]").val(),
                            productSellingPrice: $("input[name=productSellingPrice]").val(),

                            configs: {
                                addProduct,
                                internalProductSerialNumber,
                                internalProductCategorySerialNumber,
                                isWeightUnit:($('#unit').find('option:selected').attr('unit') == 'weight') ? true : false
                            }

                        }

                        $.post('/productCategory/new', { payload: JSON.stringify(payload) }).then(recipientID => {
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
                    window.location = `/productCategories/page/get`
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
                    window.location = `/productCategories/page/get`


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

        $('#unit').on('change', function (e) {
            const selectedUnit = $(this).find('option:selected').attr('unit')
            if (selectedUnit == 'weight') {
                $('#productSellingPriceBlock').addClass('d-none')
                isWeightUnit = true
            } else {
                $('#productSellingPriceBlock').removeClass('d-none')
                isWeightUnit = false
            }
        })

        $('#productCategorySerialNumberBtn').on('change', function (e) {
            if (this.checked) {
                $('#productCategorySerialNumberBlock').addClass('d-none')
                internalProductCategorySerialNumber = true
            } else {
                $('#productCategorySerialNumberBlock').removeClass('d-none')
                internalProductCategorySerialNumber = false
            }
        })
        $('#addProduct').on('change', function (e) {
            if (this.checked) {
                $('#productBlock').removeClass('d-none')
                addProduct = true
            } else {
                $('#productBlock').addClass('d-none')
                addProduct = false
            }
        })


        $('#productSerialNumberBtn').on('change', function (e) {
            if (this.checked) {
                $('#productSerialNumberBlock').addClass('d-none')
                internalProductSerialNumber = true
            } else {
                $('#productSerialNumberBlock').removeClass('d-none')
                internalProductSerialNumber = true
            }
        })

        $("#unit , #supplier").select2({
            dropdownParent: $("#kt_modal_add_productCategory")
        });



    }

    return {
        // Public functions
        init: function () {
            // Elements
            modal = new bootstrap.Modal(document.querySelector('#kt_modal_add_productCategory'));

            form = document.querySelector('#kt_modal_add_productCategory_form');
            submitButton = form.querySelector('#kt_modal_add_productCategory_submit');
            cancelButton = form.querySelector('#kt_modal_add_productCategory_cancel');
            closeButton = form.querySelector('#kt_modal_add_productCategory_close');



            handleForm();
        }
    };
}();





// On document ready
KTUtil.onDOMContentLoaded(function () {

    KTModalProductCategoryAdd.init();
});

