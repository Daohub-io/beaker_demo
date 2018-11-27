# Demo Guide
_Please Note: the demo and kernel is still in development_


### What does this demo do:
* Create a Beaker-Compatible Contract and view other existing contracts in the network
* View it's current ABI Interface, Storage, Logs and Procedures
* Allows you to make sample calls to the interface and see how that affects the contract.  

## Local Demo
At the current moment, the demo is only available localy, hopefully it will be available soon online without needing to built it yourself.

### Dependencies
In order to run the demo locally you will need several dependencies to install:
* Nodejs (v8 or greater)
* Npm
* Git

### Setup

```bash
# Pull repository
git pull git@github.com:Daolab/beaker_demo.git

# Enter
cd ./beaker_demo

# Install Deps
npm install

# Serve with hot reload at localhost:8080
npm run serve

# Start a test eth server in a seperate console
npm run eth-local
```

### Local Demo

Now you can open your browser of choice and open: http://localhost:8080

You should now see:

Top Bar:
* Shows the current address of the contract you are viewing
* You can either pick from the dropdown other already-existing contracts in the network
* You can create a new contract, and pick a sample template


Four columns:
* **Interface:** Reveals the ABI interface of the current contract you are viewing
* **Procedures**: Reveals what procedures this contract has installed, each procedure has access to a limited list of storage and log capabilites
* **Storage Capabilites**: Reveals what storage locations are in use by the contract and which procedures have access to them
* **Log Capabilites**: Reveals what log the contract can make, and which procedures have access to them.

### Storage Example:

Let's create a new contract instance from an existing template:

* Click New on the top right bar.
* For _Name_ put in _Storer_
* For _Account_, choose whichever address, (doesn't matter)
* For _Sample Procedure_, choose _Write to Storage_ Procedure
* Click **Ok**
* Wait for a little while for the instance to load (5s)
* Now you should see an instance with two procedures: Entry and _Storer_
* The _Storer_ Procedure has two storage capabilites: One from (`34048-34049`) and (`32768-32769`)
* If you look at the Interface, you can see you can make a call to the _Storer_ which has a function named "S". Click the **Call** button and see what happens.
* Once clicked you should see that the value in storage location: `32768` has been incremented. Which means that the _Storer_ procedure used the Storage Procedure (`32768-32769`) to read the storage value then request the kernel to modify the `value` by `value+1`

