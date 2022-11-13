/**
 * Monitor element visibility, and trigger callback when element becomes visible
 * The callback is triggered only once.
 * @param element {HTMLElement}
 * @param callback {Function} Called with the element
 */
 export function callOnceVisible(element: HTMLElement, callback: (element: HTMLElement) => void): void {
    if (isIntersectionObserverSupported()) {
        const intersectionObserver = new IntersectionObserver((changes: IntersectionObserverEntry[], observer: IntersectionObserver) => {
            changes.forEach(intersection => {
                if (intersection.isIntersecting) {
                    callback(element);
                    observer.disconnect();
                }
            });
        });
        intersectionObserver.observe(element);
    } else {
        if (isInView(element)) {
            callback(element);
        } else {
            const eventCallback = () => {
                if (isInView(element)) {
                    callback(element);
                    window.removeEventListener('scroll', eventCallback);
                }
            }
            window.addEventListener('scroll', eventCallback);        
        }
    }
}

function isIntersectionObserverSupported(): boolean {
    return typeof IntersectionObserver !== 'undefined';
}

function isInView(element: HTMLElement): boolean {
    const { top, left, bottom, right }: Partial<DOMRect> = element.getBoundingClientRect();
    return  bottom >= 0 && right >= 0 
            && left <= (window.innerWidth || document.documentElement.clientWidth) 
            && top <= (window.innerHeight || document.documentElement.clientHeight);
}
