/**
 * Script to create hotkeys for Google Assistant queries
 * Requires credentials.json (generated by authhelper.js) to connect to Google Assistant
 * Edit hotkeys.json to create / modify hotkeys
 */

const {Assistant, AssistantLanguage} = require('nodejs-assistant');
const credentials = require('./credentials.json');
const hotkeys = require('./hotkeys.json')
const ioHook = require('iohook');

//Create interface with Google Assistant
const assistant = new Assistant(credentials, {
    deviceId: 'device id', 
    deviceModelId: 'device model id', //Shouldn't need to be changed
    locale: AssistantLanguage.ENGLISH,
  });

//Creates hotkeys for hotkeys found in hotkeys.json
async function createHotkeys(assistant) {
  //Iterate through JSON keys
  for(let key in hotkeys) {
    //Trigger type command, one keybind maps to one query
    if(hotkeys[key].type == "trigger") {
      //Create hook to query assisant when hotkey is activated
      ioHook.registerShortcut(hotkeys[key].keybind, (keys) => {
        assistant.query(hotkeys[key].query);
      });
    }
    //Toggle type coomand, one keybind maps to two alternating queries
    if(hotkeys[key].type == "toggle") {
      //Set default status and ensure device status is the same
      let status = hotkeys[key].defaultstatus;
      if(status == "off") {
        assistant.query(hotkeys[key].offquery);
      } else if(status == "on") {
        assistant.query(hotkeys[key].onquery);
      }
      //Create hook to query assistant when hotkey is activated, switch between "on" and "off" commands based on current status
      ioHook.registerShortcut(hotkeys[key].keybind, (keys) => {
        if(status == "off") {
          assistant.query(hotkeys[key].onquery);
          //Change status to on
          status = "on";
        } else if(status == "on") {
          assistant.query(hotkeys[key].offquery);
          //Change status to off
          status = "off";
        }
      });
    }
  }
}

//Create hooks for hotkeys, then start hooks
createHotkeys(assistant).then(() => {
  ioHook.start();
});
