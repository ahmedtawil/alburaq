const errDisplay = ({ responseJSON }) => {
    const message = responseJSON.message
    if (message.constructor == Array) {
        return message.map((msg)=>`${msg}`).join(' , ')
    }
    return message
}

  