/*
 * views/index.js
 * 
 * The /index.html view script
 * 
 */

function render_index(req, res)
{
    res.render('index', {});
    return;

    if (req.session) {
        res.render('index', {
            layout: false, 
            login_message : req.session.login_message
        });
        req.session.login_message = null;
    } else {
        res.render('index', {
            layout: false
        });
    }
}

module.exports = function _init_routes(app) {
    
    // Load the index page
    app.get('/', render_index);

};


