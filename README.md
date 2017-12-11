## Accessing Event Registry data through JS


This library contains classes that allow one to easily access the event and article information from Event Registry (http://eventregistry.org).

Most of the package is quite similar to [Event Registry Python](https://github.com/EventRegistry/event-registry-python)  so for all who are already acquainted with the Python version there shouldn't be any problems with using this package.

### Installation

Event Registry package can be installed using the NodeJS Package Manager. Type the following in the command line:

`npm install eventregistry`

and the package should be installed. Alternatively, you can also clone the package from the GitHub repository. After cloning it, open the command line and run:

`npm build`

### Validating installation 

To ensure that the package has been properly installed type the following in you JS file:

`import { EventRegistry } from "eventregistry";`

If this doesn't produce any kind of error messages then your installation has been successful.

### Updating the package

As features are added to the package you will need at some point to update it. In case you have downloaded the package from GitHub simply do a `git pull`. If you have installed it using the `npm` command, then simply run:

`npm update eventregistry`

### Authentication and API key

When making queries to Event Registry you will have to use an API key that you can obtain for free. 
