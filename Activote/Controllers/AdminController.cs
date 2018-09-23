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
        // GET: Admin
        public ActionResult UploadFrame()
        {
            return View(db.Actions.ToList());
        }

        [HttpPost]
        public ActionResult UploadFrame(Frame frame, HttpPostedFileBase file)
        {
            frame.FrameExtension = Path.GetExtension(file.FileName);
            using (BinaryReader br = new BinaryReader(file.InputStream))
            {
                frame.FrameBytes = br.ReadBytes(file.ContentLength);
            }
            db.Frames.Add(frame);
            db.SaveChanges();
            return View(db.Actions.ToList());
        }
    }
}