/**
 * Created by chuso_000 on 22/9/2015.
 */

import hp from './helper.js';
export default class customEvents{
    /*  these events in here will bind to @node */
    constructor(node){
        this.node = node;
        this.actions = {};

    }

    /* arguments[0] -> typeof == options ? options : handler
    *  arguments[1] --> typeof == function --> handler
    *  Options: { valid: () => { return true or false }}*/
    subscribe(action, options){
        options = options || {when:()=>true};
        this.actions[action] = {
            options
        };
        if (options.bindTo && options.events && options.ifTrue){
            let param = {};
            options.events = typeof options.events!="string"? options.events.join(' ') : options.events;
            param[options.events] = ()=>{
                if (options.when()){
                    options.ifTrue();
                }
                else if (options.ifFalse && !options.when()){
                    options.ifFalse();
                }
            };
            EventListener.addEventListener().on(options.bindTo).with(param);
        }

        return this;
    }
    check(action){
        return this.actions[action].options.when();
    }

    call(action, context){
        if (Object.getOwnPropertyNames(this.actions).indexOf(action) > -1)
            this.actions[action].handler.call(context, arguments);
        else console.error(`${action} hasn't been subscribed!`);
    }
}