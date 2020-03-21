﻿$(function () {
    // ----- Event handlers -----
    // --- Netcoupe Flight
    $('#btn-get-flight').on('click',
        function () {
            flightId = $('#lbl-flight-id').val();
            console.log("Loading Netcoupe flight#" + flightId);
            loadFlight(flightId);
        });
    // --- Day + 1
    $('#btn-day-forward').on('click',
        function () {
            reloadPage(1);
        });
    // --- Day + -1
    $('#btn-day-backward').on('click',
        function () {
            reloadPage(-1);
        });

    // ----- Button and panels interface = pure UI -----
    // Date 
    $('#up-down-arrow').on('click', function () {
        $('#reducible').toggleClass('d-none');
        $(this).toggleClass('up-arrow down-arrow');
    })

    // Flight
    $('#flight-button').on('click', function () {
        $('#flight-container').removeClass('d-none');
        $(this).addClass('d-none');
    });

    $('#flight-container img.left-arrow').on('click', function () {
        $('#flight-container').addClass('d-none');
        $('#flight-button').removeClass('d-none');
    });

    // Vario
    $('#vario-button').on('click', function () {
        $('#vario-container').removeClass('d-none');
        $(this).addClass('d-none');
    });

    $('#vario-container img.left-arrow').on('click', function () {
        $('#vario-container').addClass('d-none');
        $('#vario-button').removeClass('d-none');
    });

    // Layers
    $('#layers-button').on('click', function () {
        $('#layers-container').removeClass('d-none');
        $(this).addClass('d-none');
    });

    $('#layers-container img.left-arrow').on('click', function () {
        $('#layers-container').addClass('d-none');
        $('#layers-button').removeClass('d-none');
    });

    // Extra Features
    $('#xtra-features-button').on('click', function () {
        $('#xtra-features-container').removeClass('d-none');
        $(this).addClass('d-none');
    });

    $('#xtra-features-container img.left-arrow').on('click', function () {
        $('#xtra-features-container').addClass('d-none');
        $('#xtra-features-button').removeClass('d-none');
    });
    
    // Timeline
    $('#timeline-button').on('click', function () {
        $('#flight-timeline .map-overlay-inner').removeClass('d-none');
        $(this).addClass('d-none');
    });

    $('#commands img.left-arrow').on('click',
        function() {
            $('#flight-timeline .map-overlay-inner').addClass('d-none');
            $('#timeline-button').removeClass('d-none');
        });

    // Destroy the timeline
    $('#commands img.cross').on('click',
        function() {
            $('#flight-timeline').addClass('d-none');
            deleteIconAndTimeline();
        });
}); 
