# mycroft
mycroft is an open source web application for filtering videos based on information like position, time and objects in the video. mycroft was originally developed as a proof of concept for the Swedish Police as a bachelor project in software engineering at Linköping University.

## Configuration
To set up the project, you will have to install Django and Django REST.
To do this you will probably want to create a _Python Virtual Environment_.

### Prerequisites
The following tools are expected to be installed on the hosting machine.

If building on _Windows_, makes sure to update the _PATH Environment Variable_.
This is usually an option in the installer.

* Python 3.8.1
* Node.js

Note: If you can not run python from the terminal and you have already added the path. Move the path for python in Environment Variable, to the top. This will prioritize this path over the ones below.

To make sure everything is installed, run:
* `python --version`
* `npm -v`
* `node -v`

### Create Virtual Environment
Run `python -m venv venv` in the root-folder of the project to create a folder called venv.

### Activate Virtual Environment
Still in the root folder, to activate the virtual environment:
* run `source venv/bin/activate` on **Linux**
* run `"venv/Scripts/activate.bat"` on **Windows cmd**
* run `./venv/Scripts/activate.ps1` on **Windows Powershell**

### Deactivate Virtual Environment
To deactivate the virtual environment, run `deactivate`.

### Install Tools

First, activate the virtual environment, then run `pip install -r requirements.txt`.

### File Requirements
To use mycroft you will have to create a dedicated folder on your system.
Once you have this folder you can create subfolders (with arbitrary file hierarchies) in which you add your videos.

**NOTE:** there shall be no videos in the root folder.

### Metadata Requirements
Along with every video you must add a metadata file (in the same folder) with information about the position, start time and camera name for the video.

The metadata file should have the same name as the video file along with an extra **.txt** suffix so for example if the video is named **my_video.mp4** the metadata file should be named **my_video.mp4.txt**.

The metadata file should include three parenthesises with the information where the first one is the position (in decimal degrees), the second is the start time and the third is the camera name. The following is an example of how a correct metadata file can look.
```
(58.4106611, 15.6198244)
(2020-05-25 15:45:59)
(my awesome camera)
```
Other than that the parentheses appear in the right order and no other parentheses appear in the file the metadata can be structured in an arbitrary way.

### Generating metadata for testing
In the purpose of testing mycroft a script **genfakemetadata.py** has been provided. The script takes a folder with videos and creates fake metadata files which can be used for testing mycroft. See [mycroft wiki](https://github.com/Software-Engineering-Bachelor-Project/mycroft/wiki#genfakemetadata) for more information.

## Running mycroft
First of all, make sure your virtual environment is activated and that you are in the root folder of mycroft.

### Adding source folders
To be able to use the videos you have prepared you will have to add your root folder with videos as an entry folder.
* run `source setentryfolder <path to folder>` on **Linux**
* run `./setentryfolder.bat <path to folder>` on **Windows Powershell**

If this worked correctly you will se a message "Successfully added entry folder."
As long as you do not modify the file system you only have to run this command once.

### Running mycroft
To start mycroft:
* run `source run` on **Linux**
* run `./run.bat` on **Windows Powershell**

If this worked correctly you should see something like "Starting development server at http://127.0.0.1:8000/" in your console. Open the specified address in a web browser (preferably Google Chrome).
Congratulation, you are now ready to start using mycroft. 

## Contribute and Contact
If you want to contribute to mycroft or contact the developers simply interact with us via our GitHub profiles, open issues or create pull requests. See [mycroft wiki](https://github.com/Software-Engineering-Bachelor-Project/mycroft/wiki#development) for technical details about contributing.

We are happy to help!
