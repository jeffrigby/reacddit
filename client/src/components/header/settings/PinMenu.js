import { useDispatch, useSelector } from 'react-redux';
import { siteSettings } from '../../../redux/actions/misc';

function PinMenu() {
  const pinMenuSetting = useSelector((state) => state.siteSettings.pinMenu);
  const dispatch = useDispatch();

  const togglePinMenu = () => {
    if (!pinMenuSetting === false) {
      // This means pin was turned off
      // @TODO move this into a component. It's confusing.
      document.body.classList.remove('show-menu');
      document.body.classList.add('hide-menu');
    }
    dispatch(siteSettings({ pinMenu: !pinMenuSetting }));
  };

  const buttonClass = pinMenuSetting ? 'light' : 'secondary';

  return (
    <button
      type="button"
      className={`btn btn-${buttonClass} btn-sm`}
      aria-label="Pin Menu"
      onClick={togglePinMenu}
    >
      <i className="fas fa-thumbtack" />
    </button>
  );
}

export default PinMenu;
