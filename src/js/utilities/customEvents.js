export const dispatchEvent = (target, name, data) => {
    const event = new CustomEvent(name, { detail: data });
    target.dispatchEvent(event);

    if (process.env.NODE_ENV === 'development') {
        console.log(event);
    }
};