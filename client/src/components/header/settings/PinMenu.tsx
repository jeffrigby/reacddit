import { Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/types/redux';
import { siteSettings } from '@/redux/slices/siteSettingsSlice';

function PinMenu() {
  const pinMenuSetting = useSelector(
    (state: RootState) => state.siteSettings.pinMenu
  );
  const dispatch = useDispatch<AppDispatch>();

  const togglePinMenu = () => {
    if (pinMenuSetting) {
      document.body.classList.remove('show-menu');
      document.body.classList.add('hide-menu');
    }
    dispatch(siteSettings({ pinMenu: !pinMenuSetting }));
  };

  const buttonVariant = pinMenuSetting ? 'light' : 'secondary';

  return (
    <Button
      aria-label="Pin Menu"
      size="sm"
      variant={buttonVariant}
      onClick={togglePinMenu}
    >
      <i className="fas fa-thumbtack" />
    </Button>
  );
}

export default PinMenu;
