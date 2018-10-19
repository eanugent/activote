using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Activote.Models;

namespace Activote.Controllers
{
    [Authorize()]
    public class AdminController : Controller
    {
        private activoteEntities db = new activoteEntities();
        [AllowAnonymous()]
        public ActionResult UploadFrame(Guid? id)
        {
            if (id.HasValue && db.People.Any(p => p.LoginGUID == id.Value))
            {
                ViewBag.guid = id.Value;
                return View(db.Actions.ToList());
            }
            else
            {
                return Content("Invalid or expired link");
            }
        }

        [HttpPost]
        [AllowAnonymous()]
        public ActionResult UploadFrame(Frame frame, HttpPostedFileBase file, Guid guid)
        {
            var pers = db.People.FirstOrDefault(p => p.LoginGUID == guid);
            if (pers != null)
            {
                frame.Person = pers;
                frame.FrameExtension = Path.GetExtension(file.FileName);
                frame.FrameByteSize = file.ContentLength;
                frame.BackgroundHex = frame.BackgroundHex.Replace("#", "");
                if (frame.BackgroundHex.Length != 6) frame.BackgroundHex = "000000";
                using (BinaryReader br = new BinaryReader(file.InputStream))
                {
                    frame.FrameBytes = br.ReadBytes(file.ContentLength);
                }
                db.Frames.Add(frame);
                db.SaveChanges();
                return View(db.Actions.ToList());
            }
            else
            {
                return Content("Invalid or expired link");
            }
        }
    }
}