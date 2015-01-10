# pewpewpew
An HTML5 shooting game using the [Quintus](http://www.html5quintus.com/) game engine. Why? Because pew pew.

Play the game [here](http://verypewpewpew.herokuapp.com/).

### Setting up dev environement
A server is necessary because Quintus requires some .json files in order to animate the sprites. Run 
<br> **_pip install -r requirements.txt_**
<br> to install bottle. That's it.
<br> Running **_python server.py_** will run the server at localhost:8000.

### Issues
* Currently using the v0.1.0 game engine instead of the v0.2.0. There seems to be some issues between the versions which break the game. In particular, the collisions are not detected properly (looking at collisions between the enemy sprite and everything else, only 'collisions' with the background are detected, not collisions with anything else)

