/**
 * Create namespace
 * @param {string} s - namespace (e.g. 'Autodesk.Viewing')
 * @return {Object} namespace
 */
AutodeskNamespace = function (s) {
    var ns = this;

    var parts = s.split('.');
    for (var i = 0; i < parts.length; ++i) {
        ns[parts[i]] = ns[parts[i]] || {};
        ns = ns[parts[i]];
    }

    return ns;
};
