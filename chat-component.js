var session_id = Math.random().toString(36).substring(7);
var ChatApp = React.createClass({
    getInitialState: function () {
        return {
            messages: [],
            images: [],
            socket: window.io('http://localhost:3000')
        }
    },

    componentDidMount: function () {
        var self = this;
        this.state.socket.on("receive-message", function (msg) {
            var messages = self.state.messages;
            // var images = self.state.images;
            if (msg.constructor === Array) {
                self.setState({images: msg});
            } else {
                messages.push(msg);
                self.setState({messages: messages});
            }
            console.log(self.state.messages)
        });
    },

    submitMessage: function () {
        var message = document.getElementById("message").value;
        var messages = this.state.messages;
        messages.push(message);
        this.setState({messages: messages});
        this.state.socket.emit("new-message", [message, session_id]);
        // this.state.socket.emit("new-message", ['', session_id]);
        // this.state.socket.emit("new-message", ['', session_id]);
    },

    render: function () {
        var self = this;
        var messages = self.state.messages.map(function (msg) {
            return (
                <li className="list-group-item"> {msg} </li>
            );
        });
        var images = self.state.images.map(function (img) {
            return (
                <img src={img} className="img-thumbnail" height="200" width="200"/>
            );
        });

        return (
            <div>
                <div className="col-xs-6 col-md-3">
                    <ul className="list-group" style={{maxHeight: 300, overflow: 'auto'}}>
                        {messages}
                    </ul>
                    <div>
                        <div className="input-group">
                            <input className="form-control" id="message" type="text"/>
                            <span className="input-group-btn">
                                <button className="btn btn-default" onClick={self.submitMessage}>Send</button>
                            </span>
                        </div>
                    </div>
                </div>
                <div>
                    {images}
                </div>
            </div>
        );
    }
});

ReactDOM.render(
    <ChatApp/>,
    document.getElementById("chat")
);