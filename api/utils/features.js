
const ucWords = (element) => element?.replace(/(?<= )[^\s]|^./g, a=>a.toUpperCase());

const getCompleteURLAvatar = (avatar) => (avatar.startsWith('http')) 
? avatar 
: `${process.env.PATH_STATIC_FILES}${avatar}`;

const isEmptyObject = ( object ) => {
    for ( const i in object ) {
        if(object.hasOwnProperty(i)) {
            return false;
        }
    }
    return true;
}

const decodeFileToString = (file, base = 'base64') =>  Buffer.from(file.buffer, base).toString()

module.exports = {
    ucWords,
    getCompleteURLAvatar,
    isEmptyObject,
    decodeFileToString,
}
