import React from "react";
import { connect } from "react-redux";

const mapState = state => {
    return {
        id: state.app.id
    };
};

interface PreviewProps {
    id: string;
    isVisible: string;
    useClass: string;
}


class Preview extends React.Component<PreviewProps> {
    constructor(props) {
        super(props);
    }

    render() {
        const { id, isVisible, useClass } = this.props;

        if (!isVisible) {
            return <div />;
        } else {
            const link = `/api/webapp/${id}/preview`;

            return (
                <div className={useClass} style={{ width: "100%", height: "100%" }}>
                    <iframe src={link} id="iframeRun" height="100%" width="100%" align="center" />;
                </div>
            );
        }
    }
}

export default connect(mapState)(Preview);
