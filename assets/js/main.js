$(document).ready(function () {
    // Función para obtener altura del navbar con cache
    let navbarHeightCache = null;
    function getNavbarHeight() {
        if (!navbarHeightCache) {
            navbarHeightCache = $('.navbar').outerHeight();
        }
        return navbarHeightCache;
    }

    // Actualizar cache en resize
    $(window).on('resize', function() {
        navbarHeightCache = null;
    });

    // Auto-cerrar navbar en móviles con validación
    function initMobileNavbar() {
        if ($(window).width() < 768) {
            const $navbarToggler = $('.navbar-toggler');
            if ($navbarToggler.length) {
                $navbarToggler.trigger('click');
                setTimeout(function () {
                    $('.navbar-collapse').collapse('hide');
                }, 3000);
            }
        }
    }
    initMobileNavbar();

    // Navegación suave con manejo de errores
    $('a.nav-link, #home-btn').on('click', function (event) {
        const target = $(this).attr('href');

        // Validar que existe el atributo href y es seguro
        if (!target || typeof target !== 'string') {
            console.warn('Enlace sin href válido encontrado');
            return;
        }

        // Sanitizar el target para prevenir inyección
        const sanitizedTarget = target.replace(/[^a-zA-Z0-9#-_]/g, '');
        
        // Permitir navegación normal si es un enlace externo
        if (target.startsWith('http') || target.startsWith('https')) {
            return;
        }
        
        // Validar que es un anchor válido
        if (!sanitizedTarget.startsWith('#') && sanitizedTarget !== '#') {
            console.warn('Target no válido:', target);
            return;
        }

        event.preventDefault();

        try {
            const navbarHeight = getNavbarHeight();
            const duration = $(window).width() < 768 ? 1200 : 800;

            if (sanitizedTarget === '#') {
                $('html, body').animate({ scrollTop: 0 }, duration);
                if (history.pushState && window.location.origin) {
                    history.pushState(null, null, '/');
                }
            } else {
                const $targetElement = $(sanitizedTarget);
                if ($targetElement.length) {
                    // Calcular offset específico para móviles
                    const isMobile = $(window).width() < 768;
                    let targetOffset;
                    
                    if (isMobile) {
                        // En móviles, usar un offset ajustado sin scroll-margin-top
                        const currentNavbarHeight = $('.navbar').outerHeight() || 56;
                        // Manejo especial para la sección de contacto
                        if (sanitizedTarget === '#contacto') {
                            targetOffset = $targetElement.offset().top - currentNavbarHeight;
                        } else {
                            targetOffset = $targetElement.offset().top - currentNavbarHeight + 45;
                        }
                    } else {
                        targetOffset = $targetElement.offset().top - navbarHeight + 0;
                    }
                    
                    // Asegurar que el targetOffset no sea negativo
                    targetOffset = Math.max(0, targetOffset);
                    
                    $('html, body').animate({ scrollTop: targetOffset }, duration);
                    if (history.pushState && window.location.origin && target.startsWith('#')) {
                        history.pushState(null, null, sanitizedTarget);
                    }
                } else {
                    console.warn('Elemento objetivo no encontrado:', sanitizedTarget);
                }
            }

            $('.navbar-collapse').collapse('hide');
            $(this).blur();
        } catch (error) {
            console.error('Error en navegación:', error);
        }
    });

    // Throttle para optimizar scroll
    let scrollTimeout;
    $(window).on('scroll', function () {
        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
        }
        
        scrollTimeout = setTimeout(function() {
            try {
                updateActiveSection();
            } catch (error) {
                console.error('Error en scroll handler:', error);
            }
        }, 16); // ~60fps
    }).scroll();

    // Función separada para actualizar sección activa (mejor rendimiento)
    function updateActiveSection() {
        const scrollDistance = $(window).scrollTop();
        const navbarHeight = getNavbarHeight();
        const viewportThird = $(window).height() / 3;
        let activeSection = null;

        $('section, header').each(function () {
            const $section = $(this);
            const sectionId = $section.attr('id');
            
            if (!sectionId) return; // Skip si no tiene ID
            
            const sectionTop = $section.offset().top - navbarHeight;
            const sectionBottom = sectionTop + $section.outerHeight();
            const triggerPoint = scrollDistance + viewportThird;

            if (triggerPoint >= sectionTop && triggerPoint <= sectionBottom) {
                activeSection = sectionId;
            }
        });

        if (activeSection) {
            updateNavigation(activeSection);
        }
    }

    // Función para actualizar navegación
    function updateNavigation(activeSection) {
        $('a.nav-link').removeClass('active');
        $('a.nav-link[href="#' + activeSection + '"]').addClass('active');
        
        if (history.replaceState && window.location.origin) {
            history.replaceState(null, null, '#' + activeSection);
        }
    }

    // Event listener para cerrar navbar (MOVIDO FUERA del scroll)
    $(document).on('click', function (event) {
        try {
            const isMobile = $(window).width() < 768;
            const isNavbarOpen = $('.navbar-collapse').hasClass('show');
            const clickOutsideNavbar = !$(event.target).closest('.navbar-collapse, .navbar-toggler').length;
    
            if (isMobile && isNavbarOpen && clickOutsideNavbar) {
                $('.navbar-collapse').collapse('hide');
            }
        } catch (error) {
            console.error('Error en click handler:', error);
        }
    });

    // Manejo moderno de eventos de página (reemplaza unload deprecated)
    if ('onpagehide' in window) {
        $(window).on('pagehide', function() {
            // Limpiar recursos si es necesario
            if (scrollTimeout) {
                clearTimeout(scrollTimeout);
            }
        });
    }

    // Usar visibilitychange como alternativa moderna
    $(document).on('visibilitychange', function() {
        try {
            if (document.hidden) {
                // Pausar animaciones cuando la página no es visible
                $('html, body').stop();
                // Limpiar timeout si existe
                if (scrollTimeout) {
                    clearTimeout(scrollTimeout);
                }
            }
        } catch (error) {
            console.error('Error en visibilitychange:', error);
        }
    });



    // Efecto de ondas al hacer clic - Solo desktop
    if ($(window).width() >= 768) {
        $(document).click(function(e) {
            const ripple = $('<div class="ripple"></div>');
            $('body').append(ripple);
            
            ripple.css({
                left: e.clientX - 25,
                top: e.clientY - 25
            });
            
            setTimeout(() => ripple.remove(), 3500);
        });
    }

    // Parallax moderno para el header
    $(window).scroll(function() {
        const scrolled = $(this).scrollTop();
        $('#inicio').css('transform', `translateY(${scrolled * 0.5}px)`);
    });
});
