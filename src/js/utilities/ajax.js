import { dispatchEvent } from './customEvents';
import { initBehaviors, destroyBehaviors, cleanupBehaviors } from '../behaviors/index';
import cssClasses from '../../constants/cssClasses';
import events from '../constants/events';

export const ajaxUpdate = (url, options = {}) => {
    const defaults = {
        body: null,
        callback: null,
        headers: {},
        history: 'push',
        initBehaviors: false,
        method: 'GET',
        replaceBodyClasses: true,
        scrollPositions: [],
        selectors: []
    };

    const combinedOptions = Object.assign({}, defaults, options);

    document.body.classList.add(cssClasses.ajaxing);

    let historyUrl = url;

    fetch(url, {
        body: combinedOptions.body,
        headers: combinedOptions.headers,
        method: combinedOptions.method
    })
    .then((response) => {
        if (response.status === 200 || response.status === 400 || response.status === 403 || response.status === 404 || response.status === 500) {
            historyUrl = response.url;
            return response.text();
        } else {
            if (process.env.NODE_ENV === 'development') {
                console.error(response);
            }

            ajaxFailed(response);
        }
    })
    .then((html) => {
        let targetDocument;

        // Parse returned text to HTML
        if (html) {
            const parser = new DOMParser();
            targetDocument = parser.parseFromString(html, 'text/html');
        }

        if (targetDocument) {
            // Replace selected elements
            combinedOptions.selectors.forEach((selector) => {
                let currentElement;
                let targetElement;
                let selectorCurrent = selector;
                let selectorTarget = selector;

                if ((typeof selector === 'object' || selector instanceof Object) && selector.current && selector.target) {
                    selectorCurrent = selector.current;
                    selectorTarget = selector.target;
                };

                currentElement = document.querySelector(selectorCurrent);
                targetElement = targetDocument.documentElement.querySelector(selectorTarget);

                if (targetElement) {
                    targetElement = targetElement.cloneNode(true);
                }

                if (currentElement && targetElement) {
                    // Destroy behaviors
                    if (combinedOptions.initBehaviors) {
                        destroyBehaviors(currentElement);
                    }

                    currentElement.replaceWith(targetElement);

                    // Force any images in the new content to be re-rendered.
                    // This is due to bugs in Safari where it doesn't correctly
                    // handle srcset or object-fit in images added via AJAX.
                    const targetImages = Array.prototype.slice.call(targetElement.querySelectorAll('img'));

                    targetImages.forEach((img) => {
                        img.outerHTML = img.outerHTML
                    });

                    // Init behaviors
                    if (combinedOptions.initBehaviors) {
                        initBehaviors(targetElement);
                    }
                } else if (currentElement) {
                    // Destroy behaviors
                    if (combinedOptions.initBehaviors) {
                        destroyBehaviors(currentElement);
                    }

                    // Remove element
                    if (currentElement.parentNode) {
                        currentElement.parentNode.removeChild(currentElement);
                    }
                }
            });

            // Update any scroll positions
            updateScrollPositions(combinedOptions.scrollPositions);

            // Cleanup behaviors
            if (combinedOptions.initBehaviors) {
                cleanupBehaviors();
            }

            // Replace body classes
            if (combinedOptions.replaceBodyClasses) {
                document.body.setAttribute('class', targetDocument.body.getAttribute('class'));
            }

            // Remove html popstate class
            // In a timeout so that it ensures that it's removed after the body classes change
            setTimeout(() => {
                document.documentElement.classList.remove(cssClasses.popstate);
            }, 1);

            // Handle history
            if (combinedOptions.history && window.history) {
                const title = targetDocument.title;

                document.title = title;

                if (combinedOptions.history === 'push') {
                    window.history.pushState(null, title, historyUrl);
                } else if (combinedOptions.history === 'replace') {
                    window.history.replaceState(null, title, historyUrl);
                }
            }

            // Call callback function
            if (combinedOptions.callback) {
                combinedOptions.callback();
            }

            // Dispatch ajax updated event
            dispatchEvent(window, events.AJAX_UPDATED, combinedOptions);
        }

        document.body.classList.remove(cssClasses.ajaxing);
    })
    .catch((error) => {
        if (process.env.NODE_ENV === 'development') {
            console.error(error);
        }

        ajaxFailed();
    });
};

export const ajaxFailed = (response = {}) => {
    document.body.classList.remove(cssClasses.ajaxing);
    dispatchEvent(window, events.AJAX_FAILED, response);
};

const updateScrollPositions = (scrollPositions) => {
    scrollPositions.forEach((scrollPosition) => {
        const element = document.querySelector(scrollPosition.selector);

        if (element && scrollPosition.scrollTop) {
            element.scrollTop = scrollPosition.scrollTop;
        }
    });
};