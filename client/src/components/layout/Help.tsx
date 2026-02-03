import { Modal } from 'react-bootstrap';
import { useModals } from '@/contexts/ModalContext';

interface Hotkey {
  keys: string[];
  description: string;
  separator?: 'then' | 'plus';
}

interface HotkeySection {
  title: string;
  hotkeys: Hotkey[];
}

interface HotkeyItemProps {
  hotkey: Hotkey;
}

function HotkeyItem({ hotkey }: HotkeyItemProps): React.ReactElement {
  const separator = hotkey.separator === 'then' ? ' then ' : ' + ';

  return (
    <div className="d-flex mb-1">
      <div className="col-md-6 text-end pe-2">
        {hotkey.keys.map((key, index) => (
          <span key={key}>
            <kbd>{key}</kbd>
            {index < hotkey.keys.length - 1 && separator}
          </span>
        ))}
      </div>
      <div className="col-md-6">{hotkey.description}</div>
    </div>
  );
}

function HotkeySectionGroup({
  section,
}: {
  section: HotkeySection;
}): React.ReactElement {
  return (
    <>
      <h5 className="mt-3 border-bottom text-center">{section.title}</h5>
      {section.hotkeys.map((hotkey) => (
        <HotkeyItem hotkey={hotkey} key={hotkey.description} />
      ))}
    </>
  );
}

const leftColumnSections: HotkeySection[] = [
  {
    title: 'Navigation',
    hotkeys: [
      { keys: ['g', 'h'], description: 'Home', separator: 'then' },
      { keys: ['g', 'p'], description: 'Popular', separator: 'then' },
      { keys: ['g', 'r'], description: 'Random', separator: 'then' },
      { keys: ['g', 'f'], description: 'Friends', separator: 'then' },
      { keys: ['g', 'b'], description: 'Posts', separator: 'then' },
      { keys: ['g', 'u'], description: 'Upvoted', separator: 'then' },
      { keys: ['g', 'd'], description: 'Downvoted', separator: 'then' },
      { keys: ['g', 's'], description: 'Saved', separator: 'then' },
    ],
  },
  {
    title: 'Filter Subreddits',
    hotkeys: [
      { keys: ['shift', 'f'], description: 'Open Filter' },
      { keys: ['down'], description: 'Next Subreddit' },
      { keys: ['up'], description: 'Prev Subreddit' },
      { keys: ['enter'], description: 'Load Subreddit' },
    ],
  },
  {
    title: 'Misc',
    hotkeys: [
      { keys: ['shift', 'l'], description: 'Login/Logout' },
      { keys: ['shift', 's'], description: 'Search' },
      { keys: ['shift', '.'], description: 'Toggle Auto Refresh' },
      { keys: ['opt', 'shift', 'd'], description: 'Toggle Debug Mode' },
      { keys: ['shift', '?'], description: 'This menu' },
    ],
  },
];

const rightColumnSections: HotkeySection[] = [
  {
    title: 'Posts',
    hotkeys: [
      { keys: ['j'], description: 'Next' },
      { keys: ['k'], description: 'Previous' },
      { keys: ['x'], description: 'Expand/Condense Post' },
      { keys: ['l'], description: 'Open Link' },
      { keys: ['o'], description: 'Open Post on Reddit' },
      { keys: ['a'], description: 'Upvote' },
      { keys: ['z'], description: 'Downvote' },
      { keys: ['s'], description: 'Save' },
      { keys: ['.'], description: 'Load New Entries' },
      { keys: ['/'], description: 'Load Next Entries' },
    ],
  },
  {
    title: 'Sort',
    hotkeys: [
      { keys: ['shift', 'c'], description: 'Controversial' },
      { keys: ['shift', 'h'], description: 'Hot' },
      { keys: ['shift', 'n'], description: 'New' },
      { keys: ['shift', 'r'], description: 'Rising' },
      { keys: ['shift', 't'], description: 'Top' },
    ],
  },
];

function Help(): React.ReactElement {
  const {
    showHotkeys,
    setShowHotkeys,
    showAutoRefresh,
    setShowAutoRefresh,
    showCondenseHelp,
    setShowCondenseHelp,
  } = useModals();

  return (
    <>
      {/* Auto Refresh Modal */}
      <Modal
        show={showAutoRefresh}
        size="sm"
        onHide={() => setShowAutoRefresh(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Auto Refresh</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Check this option to enable auto refresh. When enabled, new entries
          will automatically be loaded when scrolled to the top of the page.
          This can get crazy if you&rsquo;re on the front page and sorted by
          &lsquo;new&rsquo;.
        </Modal.Body>
      </Modal>

      {/* Condense Help Modal */}
      <Modal
        show={showCondenseHelp}
        size="sm"
        onHide={() => setShowCondenseHelp(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Condense By Default</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Condense sticky, pinned, and/or duplicate (within the same listing)
          posts by default.
        </Modal.Body>
      </Modal>

      {/* Hotkeys Modal */}
      <Modal show={showHotkeys} size="lg" onHide={() => setShowHotkeys(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Hotkeys</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="row">
            <div className="col-md-6">
              {leftColumnSections.map((section) => (
                <HotkeySectionGroup key={section.title} section={section} />
              ))}
            </div>
            <div className="col-md-6">
              {rightColumnSections.map((section) => (
                <HotkeySectionGroup key={section.title} section={section} />
              ))}
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default Help;
