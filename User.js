var fs = require('fs');
const { dirname } = require('path');

var User = {
    login: function (body, callback) {


        if (!body.username|| body.username == '')
            return callback({
                status: 500, message: "Username is required"
            })

        if (!body.password|| body.password == '')
            return callback({
                status: 500, message: "Passowrd is required"
            })


        var path = dirname(require.main.filename) + '/public/admin.json'


        var users = JSON.parse(fs.readFileSync(path, 'utf8'));
        var user = users.filter((user) => {
            return user.username == body.username && user.password == body.password
        })
        if (user.length > 0)
            return callback({
                status: 200, message: "Login successful",
                user: {
                    name: user[0].name,
                    companies: user[0].companies
                }
            })
        return callback({
            status: 500, message: "Invalid login credentials"
        })
    }
}
module["exports"] = User;