/**
 * converts an object into a query string.
 *
 * this function takes an object as input and converts it into a query string format.
 * it iterates over each property of the object. for each property:
 * - if the property has a 'multivalue' field, it concatenates the values into a single 
 *   string, separated by commas.
 * - if the property's value is an empty string, only the property name is added to the string.
 * - otherwise, it adds the property and its value in key=value format.
 *
 * @param {object} obj - the object to be converted into a query string.
 * @returns {string} a query string representing the input object.
 */
function objectToQueryString(obj) {
    let str = [];
    for (let param in obj)
        if (obj[param].multiValue)
            str.push(param + "=" + obj[param].multiValue.map((item) => item.value).join(','));
        else if (obj[param].value == '')
            str.push(param);
        else
            str.push(param + "=" + obj[param].value);

    return str.join("&");
}

const DOMAIN = "example.com"

/**
 * handles incoming requests and redirects certain host requests.
 *
 * this function is an async handler for incoming requests. it checks the host value
 * in the request headers. if the host is `${DOMAIN}`, it constructs a new location url 
 * by appending the request's uri and query string (converted using `objectToQueryString`)
 * to 'https://www.${DOMAIN}'. it then creates a response object with a 302 status code 
 * and the new location, while preserving other headers. if the host is not '${DOMAIN}',
 * the original request is returned without modification.
 *
 * @param {object} event - the event object containing the request information.
 * @returns {object} a response object with a redirection, or the unmodified request.
 */
async function handler(event) {
    const request = event.request;
    const host = request.headers.host.value;

    if (host === DOMAIN) {
        let location = "";
        let responseHeaders = {};

        for (let key in request.headers) {
            if (key.toLowerCase() !== 'host') {
                responseHeaders[key] = request.headers[key];
            }
        }

        if (Object.keys(request.querystring).length) {
            location = `https://www.${DOMAIN}${request.uri}?${objectToQueryString(request.querystring)}`;
        } else {
            location = `https://www.${DOMAIN}${request.uri}`
        }

        const response = {
            statusCode: 302,
            statusDescription: 'Found',
            headers: responseHeaders
        }
        response.headers["location"] = { "value": location }

        return response;
    }
    return request;
}
