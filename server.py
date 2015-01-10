import json
from bottle import route, run, debug, static_file

@route("/")
def home():
    return static_file('Game.html', root='')

# Static files such as images or CSS files are not served automatically
# Added a route and a callback to control which files get served and where to find them
# currently serving everything linked to from /frontend/static (js, css etc)
@route('<filepath:path>')
def server_static(filepath):
    return static_file(filepath, root='')

run(host='localhost', port=8000, debug=True)