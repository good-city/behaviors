import { dashToCamel } from '../../utilities/convertCase';

export class Base {
    constructor(behaviorName, element) {
        this.behaviorName = behaviorName;
        this.element = element;
        this.refs = {};

        this.baseInit();
    }

    baseInit() {
        this.populateRefsObject();
    }

    populateRefsObject(context = null) {
        const attribute = `data-ref-${this.behaviorName}`;

        let contexts = [this.element];

        if (context !== null) {
            if (context.constructor === Array) {
                contexts = contexts.concat(context);
            } else {
                contexts.push(context);
            }
        }

        this.refs = {};

        contexts.forEach((context) => {
            let elements = [];

            elements = Array.prototype.slice.call(context.querySelectorAll(`[${attribute}]`));

            if (context.hasAttribute(attribute)) {
                elements.unshift(context);
            }

            elements.forEach((element) => {
                const attributeValue = dashToCamel(element.getAttribute(attribute));

                if (this.refs[attributeValue]) {
                    if (this.refs[attributeValue] instanceof Array) {
                        this.refs[attributeValue].push(element);
                    } else {
                        this.refs[attributeValue] = [this.refs[attributeValue], element];
                    }
                } else {
                    this.refs[attributeValue] = element;
                }
            });
        });
    }

    cleanup() {
        // This function just needs to be here, you can override it in your classes as required
    }
}