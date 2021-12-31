"use strict";

// Class definition
// Private variables
var element;
var formElement;
var mainElement;
var resultsElement;
var wrapperElement;
var emptyElement;

var preferencesElement;
var preferencesShowElement;
var preferencesDismissElement;

var advancedOptionsFormElement;
var advancedOptionsFormShowElement;
var advancedOptionsFormCancelElement;
var advancedOptionsFormSearchElement;

var searchObject;

// Private functions
var processs = function (search) {

    $.get(`/recipients/search/${search.getQuery()}`, data => {
        const partial = `<% if (items.length>0) { %>
            <% items.forEach(recipient => { %>
             <!--begin::Item-->
            <a href="/recipient/profile/<%= recipient._id %>"
            class="d-flex text-dark text-hover-primary align-items-center mb-5">
            <!--begin::Symbol-->
            <div class="symbol symbol-40px me-4">
                <img src="/assets/media/avatars/150-1.jpg" alt="" />
            </div>
            <!--end::Symbol-->
            <!--begin::Title-->
            <div
                class="d-flex flex-column justify-content-start fw-bold">
                <span class="fs-6 fw-bold"><%= recipient.fullName %></span>
                <span class="fs-7 fw-bold text-muted"><%= recipient.formalID %></span>
            </div>
            <!--end::Title-->
           </a>
           <!--end::Item-->
            <% }) %>
            <% } else { %>
        <% } %>
    `
   
    

       mainElement.classList.add('d-none');
        if (data.length == 0) {
            // Hide results
            resultsElement.classList.add('d-none');
            // Show empty message 
            emptyElement.classList.remove('d-none');
        } else {
            const html = ejs.render(partial , {items:data})
            $('.content-search').html(html)
        
            // Show results
            resultsElement.classList.remove('d-none');
            // Hide empty message 
            emptyElement.classList.add('d-none');

        }
        search.complete();

    })
}

var clear = function (search) {
    // Show recently viewed
    mainElement.classList.remove('d-none');
    // Hide results
    resultsElement.classList.add('d-none');
    // Hide empty message 
    emptyElement.classList.add('d-none');
}



var handleAdvancedOptionsForm = function () {
    // Show
    advancedOptionsFormShowElement.addEventListener('click', function () {
        wrapperElement.classList.add('d-none');
        advancedOptionsFormElement.classList.remove('d-none');
    });

    // Cancel
    advancedOptionsFormCancelElement.addEventListener('click', function () {
        wrapperElement.classList.remove('d-none');
        advancedOptionsFormElement.classList.add('d-none');
    });

    // Search
    advancedOptionsFormSearchElement.addEventListener('click', function () {

    });
}

// Public methods

// Elements
element = document.querySelector('#kt_header_search');


wrapperElement = element.querySelector('[data-kt-search-element="wrapper"]');
formElement = element.querySelector('[data-kt-search-element="form"]');
mainElement = element.querySelector('[data-kt-search-element="main"]');
resultsElement = element.querySelector('[data-kt-search-element="results"]');
emptyElement = element.querySelector('[data-kt-search-element="empty"]');

preferencesElement = element.querySelector('[data-kt-search-element="preferences"]');
preferencesShowElement = element.querySelector('[data-kt-search-element="preferences-show"]');
preferencesDismissElement = element.querySelector('[data-kt-search-element="preferences-dismiss"]');

advancedOptionsFormElement = element.querySelector('[data-kt-search-element="advanced-options-form"]');
advancedOptionsFormShowElement = element.querySelector('[data-kt-search-element="advanced-options-form-show"]');
advancedOptionsFormCancelElement = element.querySelector('[data-kt-search-element="advanced-options-form-cancel"]');
advancedOptionsFormSearchElement = element.querySelector('[data-kt-search-element="advanced-options-form-search"]');

// Initialize search handler
searchObject = new KTSearch(element);

// Search handler
searchObject.on('kt.search.process', processs);

// Clear handler
searchObject.on('kt.search.clear', clear);

