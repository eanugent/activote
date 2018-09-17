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
        public ActionResult _Registered()
        {
            return View();
        }

        public ActionResult _InitRegistered()
        {
            return PartialView();
        }

        public ActionResult _CheckRegistration()
        {
            return PartialView(new activoteEntities().States.OrderBy(s => s.StateName).ToList());
        }

        public ActionResult _UploadImageView()
        {
            TrackedGUIDAccess.TrackedActionCompleted();
            return PartialView();
        }

        public ActionResult _ChooseFrame(string actionTag)
        {
            return PartialView(db.Frames.Where(f => f.Action.ActionTag == actionTag).ToList());
        }
    }
}