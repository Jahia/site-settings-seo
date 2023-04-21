import org.apache.commons.io.FileUtils
import org.jahia.osgi.FrameworkService
import org.jahia.registries.ServicesRegistry
import org.jahia.services.scheduler.BackgroundJob
import org.jahia.services.scheduler.JSR223ScriptJob
import org.osgi.framework.Bundle
import org.quartz.JobDataMap
import org.quartz.JobDetail
import org.quartz.SchedulerException


Bundle siteSettingsSeoBundle = null

FrameworkService.getBundleContext().getBundles().each { bundle ->
    if (bundle.getSymbolicName().equals("site-settings-seo")) {
        siteSettingsSeoBundle = bundle
    }
}
if (siteSettingsSeoBundle != null) {
    final URL migrationScriptUrl = siteSettingsSeoBundle.getResource("/META-INF/migration/migration-script.groovy");
    File groovyScript = File.createTempFile("groovyScript", ".groovy");

    FileUtils.copyURLToFile(migrationScriptUrl, groovyScript);
    JobDetail jahiaJob = BackgroundJob.createJahiaJob("Groovy migration script", JSR223ScriptJob.class);
    JobDataMap jobDataMap = new JobDataMap();
    jobDataMap.put(JSR223ScriptJob.JOB_SCRIPT_ABSOLUTE_PATH, groovyScript.getAbsolutePath());
    jobDataMap.put("userkey", "root");
    jobDataMap.put("log", log);
    jahiaJob.setJobDataMap(jobDataMap);
    try {
        ServicesRegistry.getInstance().getSchedulerService().scheduleJobNow(jahiaJob);
    } catch (SchedulerException e) {
        log.error("Error while migrating vanity urls", e)
    }
}
