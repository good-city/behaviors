import { Base } from './Base';
import cssClasses from '../../constants/cssClasses';
import events from '../../constants/events';

export class Popup extends Base {
    constructor(behaviorName, element) {
        // Call the constructor of the Base class
        super(behaviorName, element);

        // Usually start with an init
        this.init();
    }

    init() {
        // Add event listeners is a common function to call first
        this.addEventListeners();
    }

    addEventListeners() {
        // Obtain a DOM node from the refs
        const { close } = this.refs;

        // Add a 'click' event listener to the ref node

        // I usually wrap references to ref nodes in an if to stop the whole
        // JS breaking if not found, maybe there's a nicer way?
        if (close) {
            close.addEventListener('click', (e) => {
                e.preventDefault();
                this.close();
            });
        };

        // Add an event listener to the window, to listen for events from other behaviors

        // Because we are adding the event listener to the global window object, we create a reference to the function
        // as a property on the behavior, so we can remove it later and prevent many listeners building up on the window

        // I use the naming convention this.elementActionHandler for the property reference
        // and this.handleElementAction for the function name

        // Also need to bind this so the function has this available
        this.popupTriggerClickedHandler = this.handlePopupTriggerClicked.bind(this);
        window.addEventListener(events.POPUP_TRIGGER_CLICKED, this.popupTriggerClickedHandler);
    }

    handlePopupTriggerClicked(e) {
        // Obtain a property from the CustomEvent
        const { href } = e.detail;

        // Do something with it
        // Common functions should have simple names
        if (href && href.split('#')[1] === this.element.id) {
            this.open();
        } else {
            this.close();
        }
    }

    open() {
        // Add a class to the element
        // Try to use css classes for as many style changes or animations as possible
        this.element.classList.add(cssClasses.open);

        // You can also add classes to the body
        document.body.classList.add(cssClasses.popupOpen);

        // Sometimes you need to add further global event listeners
        // Here I add a click handler to the document to close the popup when I click outside of it
        this.clickHandler = this.handleClick.bind(this);
        document.addEventListener('click', this.clickHandler);

        // Alternatively these new event listeners could be separated out into another function
        this.addKeyUpHandler();
    }

    handleClick(e) {
        if (!(this.element.contains(e.target) === true)) {
            this.close();
        }
    }

    addKeyUpHandler() {
        // Here I add a keyup handler to the document to close the popup when I press escape
        this.keyUpHandler = this.handleKeyUp.bind(this);
        document.addEventListener('keyup', this.keyUpHandler);
    }

    handleKeyUp(e) {
        if (e.key === 'Escape' && this.element.classList.contains(cssClasses.open)) {
            this.close();
        }
    }

    close() {
        // Remove the open class to close
        this.element.classList.remove(cssClasses.open);

        // Remove any classes added to the body
        document.body.classList.remove(cssClasses.popupOpen);

        // Remove any event listeners added to the document that are no longer needed
        this.removeDocumentEventListeners();
    }

    removeDocumentEventListeners() {
        document.removeEventListener('click', this.clickHandler);
        document.removeEventListener('keyup', this.keyUpHandler);
    }

    cleanup() {
        // The cleanup function is called when the behavior is deleted

        // This can happen when either destroyBehaviors or cleanupBehaviors is called which usually
        // means we have removed the element from the DOM

        // In that case we should remove all globally added event listeners

        // Event listeners added to the element itself or ref nodes no longer in the DOM will be
        // removed by the normal JavaScript garbage collector, so no need to remove them manually
        window.removeEventListener(events.POPUP_TRIGGER_CLICKED, this.popupTriggerClickedHandler);
        this.removeDocumentEventListeners();
    }
}