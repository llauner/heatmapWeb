$(function () {
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
