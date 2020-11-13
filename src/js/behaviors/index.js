import * as behaviorClasses from './classes';
import events from '../constants/events';
import { capitalize, dashToCamel } from '../utilities/convertCase';
import { dispatchEvent } from '../utilities/customEvents';

let index = 0;

export const initBehaviors = (context = document.body) => {
    const { behaviorInstances } = window.myProjectName;
    const attribute = 'data-behavior';

    let contexts = [];

    if (context.constructor === Array) {
        contexts = context;
    } else {
        contexts.push(context);
    }

    contexts.forEach((context) => {
        let elements = [];

        elements = Array.prototype.slice.call(context.querySelectorAll(`[${attribute}]`));

        if (context.hasAttribute(attribute)) {
            elements.unshift(context);
        }

        elements.forEach((element) => {
            const contextBehaviors = element.getAttribute(attribute).split(' ');

            contextBehaviors.forEach((behavior) => {
                const behaviorClassName = capitalize(dashToCamel(behavior));
                const instanceAttribute = 'data-behavior-instance';
                const instanceAttributeCurrentValue = element.getAttribute(instanceAttribute) || '';

                if (!instanceAttributeCurrentValue.includes(behavior)) {
                    let instanceAttributeNewValue = instanceAttributeCurrentValue ? instanceAttributeCurrentValue + ' ' : '';
                    instanceAttributeNewValue += `${index}_${behavior}`;

                    element.setAttribute(instanceAttribute, instanceAttributeNewValue);

                    try {
                        const behaviorInstance = new behaviorClasses[behaviorClassName](behavior, element);
                        behaviorInstances[`${index}_${behavior}`] = behaviorInstance;
                        index++;
                    } catch(error) {
                        if (process.env.NODE_ENV === 'development') {
                            console.error(error);
                            console.error(`Unable to initialize the behavior "${behavior}". Have you spelt the name correctly and ensured it's exported?`);
                        }
                    }
                }
            });
        });
    });

    dispatchEvent(window, events.BEHAVIORS_INITIALIZED, {
        context: context
    });
};

export const destroyBehaviors = (context = document.body) => {
    const { behaviorInstances } = window.myProjectName;
    const attribute = 'data-behavior-instance';

    let contexts = [];

    if (context.constructor === Array) {
        contexts = context;
    } else {
        contexts.push(context);
    }

    contexts.forEach((context) => {
        let elements = [];

        elements = Array.prototype.slice.call(context.querySelectorAll(`[${attribute}]`));

        if (context.hasAttribute(attribute)) {
            elements.unshift(context);
        }

        elements.forEach((element) => {
            const contextBehaviorInstances = element.getAttribute(attribute).split(' ');
            element.removeAttribute(attribute);

            contextBehaviorInstances.forEach((behaviorInstance) => {
                if (behaviorInstances[behaviorInstance]) {
                    behaviorInstances[behaviorInstance].cleanup();
                    behaviorInstances[behaviorInstance] = null;
                    delete behaviorInstances[behaviorInstance];
                }
            });
        });
    });

    dispatchEvent(window, events.BEHAVIORS_DESTROYED, {
        context: context
    });
};

export const cleanupBehaviors = () => {
    const { behaviorInstances } = window.myProjectName;
    const attribute = 'data-behavior-instance';
    const context = document.body;

    let documentBehaviorInstances = [];
    let elements = [];

    elements = Array.prototype.slice.call(context.querySelectorAll(`[${attribute}]`));

    if (context.hasAttribute(attribute)) {
        elements.unshift(context);
    }

    elements.forEach((element) => {
        const elementBehaviorInstances = element.getAttribute(attribute).split(' ');

        elementBehaviorInstances.forEach((behaviorInstance) => {
            documentBehaviorInstances.push(behaviorInstance);
        });
    });

    Object.keys(behaviorInstances).forEach((instance) => {
        if (documentBehaviorInstances.indexOf(instance) === -1) {
            if (behaviorInstances[instance]) {
                behaviorInstances[instance].cleanup();
                behaviorInstances[instance] = null;
                delete behaviorInstances[instance];
            }
        }
    });

    dispatchEvent(window, events.BEHAVIORS_CLEANED, {
        context: context
    });
};