export default function utils(app) {
    app.sleep = (ms) => {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};
