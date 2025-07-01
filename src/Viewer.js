// import React, { useEffect, useState } from 'react'
// import Unity, { UnityContent } from "react-unity-webgl";
// import { makeStyles } from '@material-ui/core/styles';

// const unityContent = new UnityContent(
//     "Build/build.json",
//     "Build/UnityLoader.js",
//     {
//         adjustOnWindowResize: true
//     }
// );

// const useStyles = makeStyles((theme) => ({
//     root: {
//         width: "100%",
//         height: "100%"
//     },
//     unityContent: {
//         background: "white",
//         width: "100%",
//         height: "100%",
//     },
//     paper: {
//         padding: theme.spacing(2),
//         textAlign: 'center',
//         color: theme.palette.text.secondary,
//     },
// }));



// export default function Viewer(props) {
//     console.log(props)
//     const classes = useStyles();
//     const [ready, setReady] = useState(false);
//     const [fileName, setFileName] = useState(null);

//     unityContent.on("Ready", () => {
//         setReady(true)
//         loadFile();

//         if (typeof props.onReady == "function") props.onReady();
//     }
//     );

//     unityContent.on("OnLoaded", () => {
//         try {
//             if (typeof props.onLoaded == "function") props.onLoaded();
//         }
//         catch{ }
//     }
//     );

//     unityContent.on("OnError", () => {
//         try {
//             if (typeof props.onError == "function") props.onError();
//         }
//         catch{ }
//     }
//     );

//     useEffect(() => {
//         if (ready) loadFile()
//     }, [props.file]);

//     const loadFile = () => {
//         try {
//             if (props.file && typeof props.file == "object") {
//                 var reader = new FileReader();
//                 reader.onload = (function (file) {
//                     return function (e) {
//                         (window.filedata = window.filedata ? window.filedata : {})[file.name] = e.target.result;
//                         unityContent.send("root", "FileUpload", file.name)
//                         setFileName(file.name);
//                     }
//                 })(props.file);
//                 reader.readAsArrayBuffer(props.file);
//             }
//             else if (typeof props.file == "string") {
//                 unityContent.send("root", "Load", JSON.stringify({ file: props.file }))
//                 setFileName(props.file);
//             }
//             else {
//                 unityContent.send("root", "Clear");
//                 setFileName("");
//             }
//         }
//         catch (e) {
//             console.log(e);
//             if (typeof props.onError == "function") props.onError();
//         }

//     }
// console.log(unityContent)
//     return (
//         <div className={classes.root} >
//             <Unity unityContent={unityContent} height="100%" width="100%" className={classes.unityContent} />
//         </div>
//     )
// }

import React, { useEffect, useState } from 'react'
import Unity, { UnityContent } from "react-unity-webgl";
import { makeStyles } from '@material-ui/core/styles';

const unityContent = new UnityContent(
    "Build/build.json",
    "Build/UnityLoader.js",
    {
        adjustOnWindowResize: true
    }
);

const useStyles = makeStyles((theme) => ({
    root: {
        width: "100%",
        height: "100%"
    },
    unityContent: {
        background: "white", // Keep original background
        width: "100%",
        height: "100%",
    },
    paper: {
        padding: theme.spacing(2),
        textAlign: 'center',
        color: theme.palette.text.secondary,
    },
}));

export default function Viewer(props) {
    console.log(props)
    const classes = useStyles();
    const [ready, setReady] = useState(false);
    const [fileName, setFileName] = useState(null);

    unityContent.on("Ready", () => {
        setReady(true)
        loadFile();

        if (typeof props.onReady == "function") props.onReady();
    });

    unityContent.on("OnLoaded", () => {
        try {
            if (typeof props.onLoaded == "function") props.onLoaded();
        }
        catch (e) {
            console.error("Error in OnLoaded event:", e);
        }
    });

    unityContent.on("OnError", () => {
        try {
            if (typeof props.onError == "function") props.onError();
        }
        catch (e) {
            console.error("Error in OnError event:", e);
        }
    });

    useEffect(() => {
        if (ready) loadFile();
    }, [props.file]);

    useEffect(() => {
        // Listen for window resize and notify Unity
        const handleResize = () => {
            if (ready) {
                unityContent.send("root", "ResizeEvent", "");
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [ready]);

    const loadFile = () => {
        try {
            if (props.file && typeof props.file == "object") {
                var reader = new FileReader();
                reader.onload = (function (file) {
                    return function (e) {
                        (window.filedata = window.filedata ? window.filedata : {})[file.name] = e.target.result;
                        unityContent.send("root", "FileUpload", file.name);
                        setFileName(file.name);
                    }
                })(props.file);
                reader.readAsArrayBuffer(props.file);
            }
            else if (typeof props.file == "string") {
                unityContent.send("root", "Load", JSON.stringify({ 
                    file: props.file,
                    // Add config parameters that might help with lighting
                    config: {
                        enhanceLighting: true,
                        ambientIntensity: 1.5,
                        directionalIntensity: 1.2
                    }
                }));
                setFileName(props.file);
            }
            else {
                unityContent.send("root", "Clear");
                setFileName("");
            }
        }
        catch (e) {
            console.error("Error loading file:", e);
            if (typeof props.onError == "function") props.onError();
        }
    }

    // Add style overrides to improve lighting appearance
    useEffect(() => {
        // Apply CSS filter to the Unity canvas to increase brightness
        if (ready) {
            const unityCanvas = document.querySelector('canvas');
            if (unityCanvas) {
                unityCanvas.style.filter = 'brightness(1.4) contrast(1.1)';
            }
        }
    }, [ready]);

    return (
        <div className={classes.root}>
            <Unity 
                unityContent={unityContent} 
                height="100%" 
                width="100%" 
                className={classes.unityContent}
                style={{ filter: 'brightness(1.2)' }} // Add a brightness filter directly
            />
        </div>
    )
}