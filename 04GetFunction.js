function doGet(args) {
  return ContentService.createTextOutput(ScriptProperties.getProperty(args.parameter.id)).setMimeType(ContentService.MimeType.JAVASCRIPT);
}


