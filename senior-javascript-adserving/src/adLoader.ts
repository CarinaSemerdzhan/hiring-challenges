const gptUrl = "https://securepubads.g.doubleclick.net/tag/js/gpt.js";
import ADSIZES from "../config/standardSizes";
import {callOnceVisible} from "./lazyLoader";

export default class AdLoader {

    constructor() {

        this.prepareGoogleAsyncApi();

        this.loadGoogleSDK().then(() => {
            this.initGoogleSDK();
        })
    }

    private prepareGoogleAsyncApi() {
        window.googletag = (window as any).googletag || {cmd: []};
    }

    private loadGoogleSDK(): Promise<any> {
        return new Promise((resolve) => {
            this.appendScriptToHead(gptUrl).then(() => {
                googletag.cmd.push(function () {
                    //resolve this for signaling gpt sdk is ready
                    resolve(null);
                })
            });
        })
    }

    private initGoogleSDK() {
        googletag.pubads().enableSingleRequest();
        googletag.enableServices();
    }

    public registerAdSlot(domId: string, path: string) {
        const element = document.getElementById(domId);

        googletag.cmd.push(() => {
            const sizes = this.filterForFittingSize(domId, ADSIZES);
            const slot = googletag.defineSlot(path, sizes as googletag.MultiSize, domId).addService(googletag.pubads());
            //this is just for showing green boxed preview ads
            slot.setTargeting("adpreview","dev")
            googletag.enableServices();
            callOnceVisible(element, () => {
                googletag.display(element.id);
            });
        });
    }

    private filterForFittingSize(domId: string, size: googletag.GeneralSize): googletag.MultiSize {
        return this.filterMultiForFittingSizes(domId, this.isSingleTypeSize(size) ? [size] : size);
    }

    private filterMultiForFittingSizes(domId: string, sizes: googletag.MultiSize): googletag.MultiSize {
        const element = document.getElementById(domId);
        return sizes.filter(s => this.checkSizeCondition(s, element));
    }

    private checkSizeCondition(size: googletag.SingleSize, element: HTMLElement): boolean {
        if (this.isFluid(size)) {
            return true;
        }
        const {height, width} = element.getBoundingClientRect();
        return size[0] <= width && size[1] <= height;
    }


    private appendScriptToHead(scriptSrc: string): Promise<any> {
        return new Promise((resolve, reject) => {
            const s = document.createElement("script");
            s.type = "text/javascript";
            s.src = scriptSrc;
            s.onload = resolve;
            s.onerror = reject; 
            document.head.appendChild(s);
        });
    }

    private isSingleTypeSize(size: googletag.GeneralSize): size is googletag.SingleSize {
        if (this.isFluid(size)) {
            return true;
        }
        // Check if [number, number]
        return size.length === 2 && typeof size[0] === "number" && typeof size[1] === 'number';
    }

    private isFluid(size: googletag.GeneralSize): size is googletag.NamedSize {
        return typeof size === 'string' || // Check if "fluid"
            size.length === 1 && typeof size[0] === 'string'; // Check if ["fluid"]
    }
}