import { Base } from './Base';
import events from '../../constants/events';
import { dispatchEvent } from '../../utilities/customEvents';

export class PopupTrigger extends Base {
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
        // Add a 'click' event listener to the element directly
        this.element.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            // Dispatch a CustomEvent to the window and pass any needed information in the detail object
            // We use an href to link the elements so they are linked even without JavaScript
            dispatchEvent(window, events.POPUP_TRIGGER_CLICKED, {
                href: this.element.getAttribute('href')
            });
        });
    }
}