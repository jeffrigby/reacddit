import PropTypes from 'prop-types';

function RawHTML({ content }) {
  const rawhtml = content.html;

  const html = <div dangerouslySetInnerHTML={{ __html: rawhtml }} />;

  return <div className="raw-html">{html}</div>;
}

RawHTML.propTypes = {
  content: PropTypes.object.isRequired,
};

export default RawHTML;
