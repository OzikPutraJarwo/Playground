# Python README and How-to

## 1. Creating a virtual environment

Go to project's directory:

```
cd projects-name
```
Create a venv:

```
python3 -m venv venv
```

If you get an error like this:

```
The virtual environment was not created successfully because ensurepip is not
available.  On Debian/Ubuntu systems, you need to install the python3-venv
package using the following command.

    apt install python3.12-venv

You may need to use sudo with that command.  After installing the python3-venv
package, recreate your virtual environment.
```

You need to install `python3-venv` package using the following command:

```
sudo apt install python3.12-venv
```

Activate the venv:

```
source venv/bin/activate
```

## 2. Installing dependencies

Create a venv, then run:

```
pip install -r requirements.txt
```