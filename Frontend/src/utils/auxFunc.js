function formatNumber(val) {
    if (val === undefined || val === null) {
        return '';
    }
    return val.toLocaleString('es');
}


function truncateText(title, maxLength) {
    if (title.length <= maxLength) {
        return title;
    }
    return title.substring(0, maxLength) + "...";
}

export { formatNumber, truncateText };