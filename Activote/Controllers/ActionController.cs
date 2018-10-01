using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Activote.Models;

namespace Activote.Controllers
{
    [AuthorizeAttribute()]
    public class ActionController : Controller
    {
        private activoteEntities db = new activoteEntities();
        // GET: Action
        public ActionResult _RegisteredWelcome()
        {
            return PartialView();
        }

        public ActionResult _IsRegistered()
        {
            return PartialView();
        }

        public ActionResult _CheckRegistration()
        {
            return PartialView(new activoteEntities().States.OrderBy(s => s.StateName).ToList());
        }

        public ActionResult RegistrationConfirmed()
        {
            TrackedGUIDAccess.TrackedActionCompleted();
            return Json(new { success = true });
        }

        public ActionResult _UploadImageView()
        {

            return PartialView();
        }

        public ActionResult _ChooseFrame(string actionTag)
        {
            return PartialView(db.Frames.Where(f => f.Action.ActionTag == actionTag).ToList());
        }

        public ActionResult _MakePicPublic()
        {
            return PartialView();
        }

        //[ValidateAntiForgeryToken()]
        public string UploadPic(string pic, string actionTag)
        {
            pic = pic.Replace("data:image/jpeg;base64,", "").Replace("data:image/png;base64,", "");
            var newPhoto = new Photo()
            {
                PhotoBytes = Convert.FromBase64String(pic),
                MakePublic = true
            };
            newPhoto.ActionID = db.Actions.FirstOrDefault(a => a.ActionTag == actionTag).ActionID;
            if(Person.LoggedInPersonID > -1)
            {
                newPhoto.PersonID = Person.LoggedInPersonID;
            }
            db.Photos.Add(newPhoto);
            db.SaveChanges();

            return newPhoto.PhotoGUID.ToString();
        }

        public ActionResult _DownloadImageView()
        {
            return PartialView();
        }
    }
}