/** util function for sending responses
 * @param res HTTP response object
 * @param status Response status code
 * @param content Actual object representing the response content
 * */
var sendJSONResponse = function (res, status, content) {
    res.status(status);

    content = {
        message: content.msg,
        data: content.data || {}
    };

    res.json(content);
};

module.exports = {
    sendJSONResponse: sendJSONResponse
};