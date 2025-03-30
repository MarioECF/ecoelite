$(document).ready(function () {
    function getNavbarHeight() {
        return $('.navbar').outerHeight(); // Altura dinámica del navbar
    }

    if ($(window).width() < 768) {
        $('.navbar-toggler').trigger('click');
        setTimeout(function () {
            $('.navbar-collapse').collapse('hide');
        }, 3000);
    }

    $('a.nav-link, #home-btn').on('click', function (event) {
        const target = $(this).attr('href');

        // Permitir navegación normal si es un enlace externo
        if (target.startsWith('http') || target.startsWith('https')) {
            return;
        }

        event.preventDefault();

        const navbarHeight = getNavbarHeight();
        const duration = $(window).width() < 768 ? 1200 : 800;

        if (target === '#') {
            $('html, body').animate({ scrollTop: 0 }, duration);
            history.pushState(null, null, '/');
        } else {
            const targetOffset = $(target).offset().top - navbarHeight;
            $('html, body').animate({ scrollTop: targetOffset }, duration);
            history.pushState(null, null, target);
        }

        $('.navbar-collapse').collapse('hide');
        $(this).blur();
    });

    $(window).on('scroll', function () {
        const scrollDistance = $(window).scrollTop();
        const navbarHeight = getNavbarHeight();
        let activeSection = null;

        $('section,header').each(function () {
            const sectionTop = $(this).offset().top - navbarHeight;
            const sectionBottom = sectionTop + $(this).outerHeight();

            if (
                scrollDistance + $(window).height() / 3 >= sectionTop &&
                scrollDistance + $(window).height() / 3 <= sectionBottom
            ) {
                activeSection = $(this).attr('id');
            }
        });

        if (activeSection) {
            $('a.nav-link').removeClass('active');
            $('a.nav-link[href="#' + activeSection + '"]').addClass('active');
            history.replaceState(null, null, '#' + activeSection);
        }
        $(document).on('click', function (event) {
            const isMobile = $(window).width() < 768;
            const isNavbarOpen = $('.navbar-collapse').hasClass('show');
            const clickOutsideNavbar = !$(event.target).closest('.navbar-collapse, .navbar-toggler').length;
    
            if (isMobile && isNavbarOpen && clickOutsideNavbar) {
                $('.navbar-collapse').collapse('hide');
            }
        });
    }).scroll();
});
