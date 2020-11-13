export const camelToDash = (str) => {
    return str.replace(/\W+/g, '-').replace(/([a-z\d])([A-Z])/g, '$1-$2');
};

export const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};

export const dashToCamel = (str) => {
    return str.replace(/\W+(.)/g, (x, chr) => {
        return chr.toUpperCase();
    });
};